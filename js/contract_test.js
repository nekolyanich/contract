function assertRaises(callable, owner, args, exception_type, message) {
  try {
    callable.apply(owner, args);
  } catch(e) {
    if (e instanceof exception_type) {
      if (e.message != message) {
	fail("excepected: '" + message + "', got '" + e.message + "'");
      }
      return;
    }
    fail("caught exception " + e);
  }
  fail("exception " + exception_type + " was not rised");
}

function assertContractFailure(contract, value, message) {
  assertRaises(contract.check, contract, [value], ContractValidationError, message);
}

function testAnyC() {
  var c = new AnyC();
  c.check(1);
  c.check({});
  c.check(undefined);
}

function testIntC() {
  var c = new IntC();
  c.check(1);
  assertContractFailure(c, "foo", "value is not int");
  assertContractFailure(c, 1.1, "value is not int");
  var c = new IntC(2, 10);
  c.check(4);
  assertContractFailure(c, 100, "value is greater than 10");
  assertContractFailure(c, 1, "value is less than 2");
}

function testFloatC() {
  var c = new FloatC();
  c.check(1);
  c.check(1.1);
  assertContractFailure(c, "foo", "value is not float");
  c = new FloatC(2, 10);
  c.check(4);
  assertContractFailure(c, 100, "value is greater than 10");
  assertContractFailure(c, 1, "value is less than 2");
}

function testStringC() {
  var c = new StringC();
  c.check("test");
  assertContractFailure(c, "", "blank value is not allowed");
  assertContractFailure(c, 1, "value is not string");
  c = new StringC(true);
  c.check("");
}

function testOrC() {
  var c = new OrC(new IntC(), new StringC());
  c.check(1);
  c.check("test");
  assertContractFailure(c, "", "no one contract matches");
}

function testListC() {
  var c = new ListC(new IntC());
  c.check([]);
  c.check([1, 2]);
  assertContractFailure(c, [1, ""], "1: value is not int");
  c = new ListC(new ListC(new IntC()));
  c.check([]);
  c.check([[]]);
  assertContractFailure(c, [[1, 2], [""]], "1.0: value is not int");
}