describe('User verification', () => {
  it('should verify user and set username and password');
  it('should not verify user if username is already taken');
  it('should not allow verification of already verified user');
  it('should not allow login for unverified user');
  it('should allow login for verified user');
});
