/**
 * Common interfaces and implementations for lambda functions
 */

import { APIGatewayProxyResult } from "aws-lambda"

/**
 * Region we're deploying to
 */
export const awsRegion = "us-east-1"

/**
 * Name for the DynamoDB table made for storing sessions
 */
export const dynamoTableSessions = "sessions"

/**
 * Textual response with some information about something happening, but without any further data
 */
export interface InfoResponse {
  code: ResponseCode,
  msg: string,
  info?: string
}

/**
 * Creates a new API Gateway result for lambdas from an {@link InfoResponse}
 * @param resp Response to make from
 * @returns New API Gateway result to use for lambda response
 */
export function makeInfoResponse(resp: InfoResponse | string): APIGatewayProxyResult {
  // Shortcut string
  if (typeof resp == "string") {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ msg: resp, info: null })
    }
  }

  // Proper response
  const bodyPayload = {
    msg: resp.msg,
    info: resp.info == undefined ? null : resp.info
  }
  return {
    statusCode: resp.code,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyPayload)
  }
}

/**
 * Data response with some data as the core json body; use if {@link TextResponse} can't be used
 */
export interface DataResponse {
  code: ResponseCode,
  data?: object
}

/**
 * Creates a new API Gateway result for lambdas from an {@link DataResponse}
 * @param resp Response to make from
 * @returns New API Gateway result to use for lambda response
 */
export function makeDataResponse(resp: DataResponse): APIGatewayProxyResult {
  return {
    statusCode: resp.code,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resp.data == undefined ? null : resp.data)
  }
}

/**
 * Custom HTTP response code enumeration which maps to regular codes
 */
export enum ResponseCode {
  Ok = 200,
  InvalidInput = 400,
  InternalServerError = 500
}
