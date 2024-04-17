import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from "https://deno.land/x/lambda@1.42.4/mod.ts";

export async function handler(
  event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> {
  const proxy = event.pathParameters?.proxy;
  const method = event.requestContext.http.method;
  const headers = event.headers;
  const params = event.queryStringParameters;
  const body = event.body;

  if (!proxy) {
    return {
      statusCode: 400,
      body: "Missing `url` path parameter",
    };
  }

  const url = new URL(proxy);

  if (params) {
    for (const [name, value] of Object.entries(params)) {
      if (value) url.searchParams.set(name, value);
    }
  }

  const requestHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (/(host|origin)/i.test(name)) continue;
    if (value) requestHeaders.set(name, value);
  }

  const requestBody = /(POST|PUT)/i.test(method) ? body : null;

  const response = await fetch(url, {
    method,
    body: requestBody,
    headers: requestHeaders,
  });

  const responseBody = await response.text();
  const responseHeaders = Object.fromEntries(response.headers.entries())

  return {
    statusCode: response.status,
    body: responseBody,
    headers: responseHeaders,
  };
}
