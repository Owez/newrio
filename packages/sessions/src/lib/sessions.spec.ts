import { createSession, checkSessionIntent, SessionTokenIntent, SessionToken, parseSessionToken, SessionParseError, validateSessionToken } from './sessions';

const invalidWhenItsNot = "validateSessionToken is saying a token is invalid when it's not"
const validWhenItsNot = "validateSessionToken is saying a token is valid when it's not"

describe("Check present intents", () => {
  it("should check for account nicely", () => {
    const session = createSession("rio:a:abc")
    const good = checkSessionIntent(session, SessionTokenIntent.Account)
    expect(good).toBe(true)
  })

  it("should check for project nicely", () => {
    const session = createSession("rio:p:abc")
    const good = checkSessionIntent(session, SessionTokenIntent.Project)
    expect(good).toBe(true)
  })

  it("should check for user nicely", () => {
    const session = createSession("rio:u:abc")
    const good = checkSessionIntent(session, SessionTokenIntent.User)
    expect(good).toBe(true)
  })
})

describe("Check when token isn't present", () => {
  it("should check for account", () => {
    const session = createSession()
    const good = checkSessionIntent(session, SessionTokenIntent.Account)
    expect(good).toBe(false)
  })

  it("should check for project", () => {
    const session = createSession()
    const good = checkSessionIntent(session, SessionTokenIntent.Project)
    expect(good).toBe(false)
  })

  it("should check for user", () => {
    const session = createSession()
    const good = checkSessionIntent(session, SessionTokenIntent.User)
    expect(good).toBe(false)
  })
})

describe("Create new valid session", () => {
  it("should create a new account session nicely", () => {
    const session = createSession("rio:a:abc")
    const tokenExp: SessionToken = {
      intent: SessionTokenIntent.Account,
      token: "abc"
    }
    expect(session.token).toStrictEqual(tokenExp)
  })

  it("should create a new project session nicely", () => {
    const session = createSession("rio:p:abc")
    const tokenExp: SessionToken = {
      intent: SessionTokenIntent.Project,
      token: "abc"
    }
    expect(session.token).toStrictEqual(tokenExp)
  })

  it("should create a new user session nicely", () => {
    const session = createSession("rio:u:abc")
    const tokenExp: SessionToken = {
      intent: SessionTokenIntent.User,
      token: "abc"
    }
    expect(session.token).toStrictEqual(tokenExp)
  })
})

describe("Create new invalid session", () => {
  it("should fail because lack of rio ident", () => {
    let failed = true
    try {
      createSession(":a:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("should fail because lack of middle intent", () => {
    let failed = true
    try {
      createSession("rio::abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("should fail because of empty token", () => {
    let failed = true
    try {
      createSession("")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })
})

describe("Short valid tokens", () => {
  it("should parse a short account token", () => {
    const sessionToken = parseSessionToken("rio:a:test")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.Account,
      token: "test"
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })

  it("should parse a short project token", () => {
    const sessionToken = parseSessionToken("rio:p:test")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.Project,
      token: "test"
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })

  it("should parse a short user token", () => {
    const sessionToken = parseSessionToken("rio:u:test")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.User,
      token: "test"
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })
})

describe("Middle intent identifiers", () => {
  it("Should fail on an empty identifier", () => {
    let failed = true
    try {
      parseSessionToken("rio::abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("Should fail on an invalid identifier (bad char)", () => {
    let failed = true
    try {
      parseSessionToken("rio:z:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("Should fail on an invalid identifier (length)", () => {
    let failed = true
    try {
      parseSessionToken("rio:abc:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })
})

describe("Short valid but empty tokens", () => {
  it("should parse a short empty account token", () => {
    const sessionToken = parseSessionToken("rio:a:")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.Account,
      token: ""
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })

  it("should parse a short empty project token", () => {
    const sessionToken = parseSessionToken("rio:p:")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.Project,
      token: ""
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })

  it("should parse a short empty user token", () => {
    const sessionToken = parseSessionToken("rio:u:")
    const expSessionToken: SessionToken = {
      intent: SessionTokenIntent.User,
      token: ""
    }
    expect(sessionToken).toStrictEqual(expSessionToken)
  })
})

describe("Wrong or missing rio prefix", () => {
  it("should fail if it's missing with colon", () => {
    let failed = true
    try {
      parseSessionToken(":u:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("should fail if it's missing without colon", () => {
    let failed = true
    try {
      parseSessionToken(":u:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("should fail if it's completely wrong", () => {
    let failed = true
    try {
      parseSessionToken("HELLO THERE:u:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })

  it("should fail if it's slightly silly", () => {
    let failed = true
    try {
      parseSessionToken("r1o:u:abc")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })
})

describe("Weird invalid tokens", () => {
  it("should fail with some short weird invalid tokens", () => {
    let failed = true
    try {
      parseSessionToken("")
      parseSessionToken("rio::")
      parseSessionToken("a::")
      parseSessionToken(":a:")
      parseSessionToken("::a")
      parseSessionToken(":a:a")
      parseSessionToken("a:a:a")
      parseSessionToken("_:_:_")
      parseSessionToken("'; console.writeline('haha')")
      parseSessionToken("${koth}")
      parseSessionToken(":::")
    } catch (err) {
      if (err instanceof SessionParseError) {
        failed = false
      }
    }
    if (failed) {
      throw new Error("Failed to error properly")
    }
  })
})

describe("Different intent types", () => {
  it("should validate a good short account token", () => {
    const valid = validateSessionToken("rio:a:abc")
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })

  it("should validate a good short project token", () => {
    const valid = validateSessionToken("rio:p:abc")
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })

  it("should validate a good short user token", () => {
    const valid = validateSessionToken("rio:u:abc")
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })
})

describe("Longer different intent types", () => {
  const longer = "abcabcabcabcabcabcabcabcabcabcabcabcabcabcabcabc"

  it("should validate a good longer account token", () => {
    const valid = validateSessionToken(`rio:a:${longer}`)
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })

  it("should validate a good longer project token", () => {
    const valid = validateSessionToken(`rio:p:${longer}`)
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })

  it("should validate a good longer user token", () => {
    const valid = validateSessionToken(`rio:u:${longer}`)
    if (!valid) {
      throw new Error(invalidWhenItsNot)
    }
  })
})

describe("Invalid token because rio ident", () => {
  it("should be invalid if rio is missing for all intent types", () => {
    const valid = validateSessionToken(":a:abc") || validateSessionToken(":p:abc") || validateSessionToken(":u:abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })

  it("should be invalid if rio is a bit wonky for all intent types", () => {
    const valid = validateSessionToken("r1o:a:abc") || validateSessionToken("r1o:p:abc") || validateSessionToken("r1o:u:abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })

  it("should be invalid if rio is a completely wrong for all intent types", () => {
    const valid = validateSessionToken("WRONG:a:abc") || validateSessionToken("WRONG:p:abc") || validateSessionToken("WRONG:u:abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })
})

describe("Invalid token because the intent is wrong", () => {
  it("should be invalid if the intent is missing", () => {
    const valid = validateSessionToken("rio::abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })

  it("should be invalid if the intent is wrong (length)", () => {
    const valid = validateSessionToken("rio:account:abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })

  it("should be invalid if the intent is wrong (char)", () => {
    const valid = validateSessionToken("rio:z:abc")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })
})

describe("Invalid token because only a token was given", () => {
  it("should be invalid with some ascii", () => {
    const valid = validateSessionToken("basic") || validateSessionToken(":::") || validateSessionToken("hellotherethis!is.some-ascii_:that/does:stuff")
    if (valid) {
      throw new Error(validWhenItsNot)
    }
  })
})