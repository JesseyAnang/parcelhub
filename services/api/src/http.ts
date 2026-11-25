import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';

export function json(statusCode: number, body: unknown): APIGatewayProxyStructuredResultV2 {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

/** One error shape for every endpoint, so clients only have to handle one format. */
export function problem(statusCode: number, code: string, message: string, details?: unknown) {
  return json(statusCode, { error: { code, message, details } });
}

export type ParsedBody = { ok: true; value: unknown } | { ok: false };

export function parseJsonBody(event: Pick<APIGatewayProxyEventV2, 'body' | 'isBase64Encoded'>): ParsedBody {
  if (!event.body) return { ok: false };
  const text = event.isBase64Encoded ? Buffer.from(event.body, 'base64').toString('utf8') : event.body;
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch {
    return { ok: false };
  }
}
