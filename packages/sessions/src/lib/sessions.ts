/**
 * Core session interfaces and functions for shared use
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Type cover for the raw (stringified) session tokens before being made into {@link Session}
 * 
 * Note that this is the full `rio:a:token` and *not* just the `token` part itself
 */
export type SessionTokenString = string

/**
 * Session information for current request
 */
export interface Session {
  internalId: string,
  token?: SessionToken
}

/**
 * Generates a new session instance based on the provided session token
 * @param sessionToken Session token (if given) from request
 * @returns New session with a newly-created internal identifier
 */
export function createSession(sessionTokenString?: SessionTokenString): Session {
  return {
    internalId: uuidv4(),
    token: (sessionTokenString == undefined) ? undefined : parseSessionToken(sessionTokenString)
  }
}

/**
 * Checks the intent of a session, covering the case that {@link Session.token} is undefined
 * @param session Session to check
 * @param intent Intent to check against
 * @returns If {@link session}'s intent is to use the {@link intent} provided
 */
export function checkSessionIntent(session: Session, intent: SessionTokenIntent): boolean {
  return session.token != undefined && session.token.intent === intent
}

/**
 * Request-provided token information for more granular access
 */
export interface SessionToken {
  intent: SessionTokenIntent,
  token: string
}

/**
 * Validates the incoming {@link token} *lightly*; see {@link parseSessionToken} to fully parse
 * @param token Token to validate
 * @returns True if the token is valid
 */
export function validateSessionToken(sessionTokenString: SessionTokenString): boolean {
  // Check length and start
  if (sessionTokenString.length > 100 || !sessionTokenString.startsWith("rio:")) { return false }

  // Split and check relevant split lengths
  const splitted = sessionTokenString.split(":")
  if (splitted.length != 3 || splitted[1].length != 1) { return false }

  // Check intent
  if (splitted[1] != "a" && splitted[1] != "p" && splitted[1] != "u") { return false }

  // Say it's valid if we couldn't see anything wrong with it
  return true
}

/**
 * Access intent (or level) for a {@link SessionToken}
 */
export enum SessionTokenIntent {
  Account,
  Project,
  User
}

/**
 * Parses a stringified session token, e.g. `rio:a:qfwewffw` or `rio:u:kwmdkmkm`
 * @param sessionToken Session token to parse
 * @returns New {@link SessionToken} or {@link SessionParseError}
 */
export function parseSessionToken(sessionTokenString: SessionTokenString): SessionToken {
  // Get first and last part of the token
  const splitted = sessionTokenString.split(":", 3) // TODO: 2 or 3?
  if (splitted.length != 3 || splitted[0] != "rio") {
    throw new SessionParseError()
  }
  const [_rio, intentDiscriminator, token] = splitted

  // Generate new object
  return {
    intent: parseSessionTokenIntent(intentDiscriminator),
    token: token
  }
}

/**
 * Parses session token intent discriminator (the part before `:`) from a stringified session token
 * @param discriminator Intent discriminator (e.g. `ua`)
 * @returns Parsed intent from the discriminator or {@link SessionParseError}
 */
function parseSessionTokenIntent(discriminator: string): SessionTokenIntent {
  // Check length
  if (discriminator.length != 1) {
    throw new SessionParseError("Invalid session intent discriminator")
  }

  // Parse discriminator value
  switch (discriminator) {
    case "a":
      return SessionTokenIntent.Account
    case "p":
      return SessionTokenIntent.Project
    case "u":
      return SessionTokenIntent.User
    default:
      throw new SessionParseError(`Unknown session intent discriminator '${discriminator}' provided`)
  }
}

/**
 * Parsing error for {@link SessionToken} and token-like information
 */
export class SessionParseError extends Error {
  constructor(message: string = "Invalid session token") {
    super(message)
    this.name = "SessionParseError"
  }
}