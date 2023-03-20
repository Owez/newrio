import { APIGatewayEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { Session, createSession } from "sessions";
import { makeDataResponse, ResponseCode, dynamoTableSessions, makeInfoResponse, awsRegion } from "common-lambda";
import { AttributeValue, DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export async function handler(event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
    // Generate session
    let session: Session;
    try {
        createSession(event.body == null ? undefined : event.body)
    } catch {
        return makeInfoResponse({ code: ResponseCode.InvalidInput, msg: "Invalid session token" })
    }

    // Add to store
    try {
        await addSessionToTable(session)
    } catch {
        return makeInfoResponse({ code: ResponseCode.InternalServerError, msg: "Failed to add to database" })
    }

    // Return generated session
    return makeDataResponse({ code: ResponseCode.Ok, data: session })
}

/**
 * Adds a new session to the DynamoDB sessions table
 * @param session The session to add to the table
 */
async function addSessionToTable(session: Session) {
    // Don't add if it's an anonymous session
    if (session.token == undefined) { return }

    // Set up the parameters for the PutItemCommand
    const params = {
        TableName: dynamoTableSessions,
        Item: {
            internalId: { S: session.internalId },
            token: session.token
                ? {
                    M: {
                        intent: { N: session.token.intent.toString() },
                        token: { S: session.token.token }
                    }
                }
                : { NULL: true }
        } as Record<string, AttributeValue>
    };

    // Create a new PutItemCommand using the parameters then send
    const command = new PutItemCommand(params);
    const client = new DynamoDBClient({ region: awsRegion })
    await client.send(command);
}
