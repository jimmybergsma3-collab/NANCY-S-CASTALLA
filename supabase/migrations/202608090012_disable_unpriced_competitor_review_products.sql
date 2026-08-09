-- Disable all products that remained unpriced after the 100-product competitor price review.
-- Checked on 2026-08-09. These products stay offline because margin, package basis,
-- or competitor price certainty was not good enough for safe publication.

update products
   set product_status = 'disabled',
       is_visible = false,
       ready_for_publish = false,
       sales_unit_confirmed = false,
       price_basis_confirmed = false,
       additional_info = 'Concurrentieprijs review 2026-08-09: offline gezet omdat dit product niet veilig geprijsd is; marge, verpakking of bron was onvoldoende zeker.'
 where supplier ilike '%Europ%'
   and id in (
     'NC-02516', 'NC-02596', 'NC-02614', 'NC-02624', 'NC-02656',
     'NC-02661', 'NC-02673', 'NC-02676', 'NC-02679', 'NC-02680',
     'NC-02681', 'NC-02684', 'NC-02685', 'NC-02688', 'NC-02713',
     'NC-02714', 'NC-02717', 'NC-02718', 'NC-02720', 'NC-02721',
     'NC-02738', 'NC-02742', 'NC-02743', 'NC-02744', 'NC-02746',
     'NC-02747', 'NC-02749', 'NC-02750', 'NC-02752', 'NC-02753',
     'NC-02755', 'NC-02757', 'NC-02758', 'NC-02759', 'NC-02760',
     'NC-02766', 'NC-02769', 'NC-02771', 'NC-02780', 'NC-02782',
     'NC-02869', 'NC-02870', 'NC-02871', 'NC-02872', 'NC-02875',
     'NC-02876', 'NC-02877', 'NC-02878', 'NC-02882', 'NC-02960',
     'NC-02961', 'NC-02962', 'NC-02964', 'NC-02965', 'NC-02968',
     'NC-02972', 'NC-02973', 'NC-02977', 'NC-02979', 'NC-03039',
     'NC-03040', 'NC-03041', 'NC-03049', 'NC-03053', 'NC-03056',
     'NC-03179', 'NC-03188', 'NC-03225', 'NC-03234', 'NC-03235',
     'NC-03276', 'NC-03315', 'NC-03329', 'NC-03351', 'NC-03394',
     'NC-03408', 'NC-03410'
   );
