-- Disable active bulk products above 3.5kg.
-- Business reason: these are mostly horeca/bulk products and should not be publicly orderable.
-- This keeps the products in admin history but removes them from the public catalogue.

update products
   set product_status = 'disabled',
       is_visible = false,
       featured = false,
       ready_for_publish = false
 where id in (
   'NC-02510',
   'NC-02511',
   'NC-02512',
   'NC-02513',
   'NC-02514',
   'NC-02515',
   'NC-02564',
   'NC-02584',
   'NC-02786',
   'NC-02787',
   'NC-02789',
   'NC-02790',
   'NC-02791',
   'NC-02868',
   'NC-03365'
 );
