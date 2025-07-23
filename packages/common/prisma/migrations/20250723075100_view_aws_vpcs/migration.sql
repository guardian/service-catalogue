-- @formatter:off -- this stops IntelliJ from reformatting the SQL
begin transaction;
    drop view if exists view_aws_vpcs;
    drop function if exists fn_view_aws_vpcs;

    create function fn_view_aws_vpcs() returns table (
        account_id text
        , region text
        , vpc_id text
        , vpc_cidr_block text
        , is_default boolean
        , subnet_id text
        , subnet_type text
        , subnet_cidr_block text
        , subnet_total_addresses bigint
        , subnet_remaining_addresses bigint
        , subnet_in_use boolean
        , subnet_route_table_id text
    ) as $$
        with constants as (
            /*
             5 addresses are reserved by AWS.
             See https://docs.aws.amazon.com/vpc/latest/userguide/subnet-sizing.html#subnet-sizing-ipv4.
             */
            select  5 as unusable_addresses
        )

        /*
         Build a list of VPC route tables and the subnet they're associated with.
         This association can either be:
           - Explicit: where the subnet is in the `associations` column; OR
           - Implicit: where the `association` is `Main`
         NOTE: Only subnets with an explict association are returned at this point.

         We also determine if there is a public route (i.e. an internet gateway open to the world).
         NOTE: As route table can have multiple routes, a subnet could appear as both public and private at this point.
        */
        , part1 as (
            select  distinct rt.account_id
                    , rt.region
                    , rt.vpc_id
                    , rt.route_table_id
                    , assoc ->> 'SubnetId' as subnet_id
                    , (assoc ->> 'Main')::boolean as is_main
                    , case
                        when roots ->> 'GatewayId' like 'igw-%' and roots ->> 'DestinationCidrBlock' = '0.0.0.0/0' then 'public'
                        else 'private'
                      end as route_type
            from    aws_ec2_route_tables rt
                    , jsonb_array_elements(rt.associations) AS assoc
                    , jsonb_array_elements(rt.routes) as roots
        )

        /*
         Build a list of subnets and the route to it (public or private).
         Also calculate the total number of IP addresses available and the remaining number that can be allocated.
        */
        , part2 as (
            select  subnet.request_account_id as account_id
                    , subnet.request_region as region
                    , subnet.vpc_id
                    , subnet.subnet_id

                    /*
                     If a subnet is not explicitly associated with a route table, we look for the main route table.
                     */
                    , case
                        when part1.route_table_id is null then (
                            select      d.route_type
                            from        part1 as d
                            where       d.is_main = true
                                        and subnet.vpc_id = d.vpc_id
                                        and subnet.request_account_id = d.account_id
                                        and subnet.request_region = d.region

                            /*
                             From `part1` we have a row for each route in a route table.
                             By ordering by `route_type` and taking the first item, we say a subnet is public if it has a public route.
                             This is a bit of a hack, as it relies on "public" being alphabetically before "private", but it works for now.
                            */
                            order by    d.route_type desc
                            limit       1
                          )
                      else part1.route_type
                    end as subnet_type
                    , case
                        when part1.route_table_id is null then (
                            select      d.route_table_id
                            from        part1 as d
                            where       d.is_main = true
                                        and subnet.vpc_id = d.vpc_id
                                        and subnet.request_account_id = d.account_id
                                        and subnet.request_region = d.region
                            order by    d.route_type desc -- see above for an explanation of this
                            limit       1
                        )
                        else part1.route_table_id
                      end as route_table_id

                    , 2^(32 - masklen(subnet.cidr_block::cidr)) - constants.unusable_addresses as subnet_total_addresses
                    , subnet.available_ip_address_count as subnet_remaining_addresses
                    , subnet.cidr_block
                    , subnet.tags
            from    constants
                    , aws_ec2_subnets subnet
                    left join part1 on subnet.request_account_id = part1.account_id
                    and subnet.request_region = part1.region
                    and subnet.vpc_id = part1.vpc_id
                    and subnet.subnet_id = part1.subnet_id
        )
        , public_subnets as (
            select  *
                    , subnet_total_addresses - subnet_remaining_addresses - 1 > 0 as subnet_in_use -- each public subnet has 1 elastic IP associated with it
            from    part2
            where   part2.subnet_type = 'public'
        )
        , private_subnets as (
            select  *
                    , subnet_total_addresses - subnet_remaining_addresses > 0 as subnet_in_use
            from    part2
            where   part2.subnet_type = 'private'

                    /*
                     From `part1` we can have one row with a subnet being "public" and another row with it being "private".
                     Here, we dedupe this.
                     */
                    and part2.subnet_id not in (select subnet_id from public_subnets)
        )
        , subnets as (
            select  *
            from    public_subnets
            union all
            select  *
            from    private_subnets
        )
        , cidr_blocks as (
            select  vpc_id
                    , jsonb_array_elements(cidr_block_association_set) ->> 'CidrBlock' AS vpc_cidr_block
            from    aws_ec2_vpcs
        )
        , cidr_block_string as (
            select      vpc_id
                        , string_agg(vpc_cidr_block, ', ') as vpc_cidr_block
            from        cidr_blocks
            group by    vpc_id
        )

        /*
         Build a list of VPCs and their associated subnets.
         Although it is not calculated here:
           - A VPC is unused if all its subnets are unused
           - The total number of IP addresses available in a VPC is the sum of the total number of IP addresses available in its subnets
         */
        , data as (
            select  vpc.account_id
                    , vpc.region
                    , vpc.vpc_id
                    , cidr.vpc_cidr_block as vpc_cidr_block
                    , vpc.is_default
                    , subnets.subnet_id
                    , subnets.subnet_type
                    , subnets.cidr_block as subnet_cidr_block
                    , subnets.subnet_total_addresses
                    , subnets.subnet_remaining_addresses
                    , subnets.subnet_in_use
                    , subnets.route_table_id as subnet_route_table_id
            from    aws_ec2_vpcs vpc
                    join subnets on vpc.vpc_id = subnets.vpc_id
                    and vpc.account_id = subnets.account_id
                    and vpc.region = subnets.region
                    join cidr_block_string as cidr on vpc.vpc_id = cidr.vpc_id
        )

        select  *
        from    data;
    $$ language sql;

    create view view_aws_vpcs as (
        select  *
        from    fn_view_aws_vpcs()
    );
commit transaction;