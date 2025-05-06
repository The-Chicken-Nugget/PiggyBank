describe('Login & dashboard', ()=>{
    it('shows accounts after login', ()=>{
      cy.visit('http://localhost:5173/login');
      cy.get('input[placeholder="email"]').type('demo@test.com');
      cy.get('input[type="password"]').type('demo{enter}');
      cy.contains('Your accounts');
      cy.contains('12345678');
    });
  });
  