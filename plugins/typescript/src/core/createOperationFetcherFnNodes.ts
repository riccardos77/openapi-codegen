import { OperationObject } from "openapi3-ts";
import ts, { factory as f } from "typescript";
import { createZodValidatorResponse } from "../utils/zodHelper";
import { camelizedPathParams } from "./camelizedPathParams";

/**
 * Create the declaration of the fetcher function.
 *
 * @returns Array of nodes
 */
export const createOperationFetcherFnNodes = ({
  dataType,
  errorType,
  requestBodyType,
  queryParamsType,
  pathParamsType,
  headersType,
  variablesType,
  fetcherFn,
  operation,
  url,
  verb,
  name,
  printNodes,
}: {
  dataType: ts.TypeNode;
  errorType: ts.TypeNode;
  requestBodyType: ts.TypeNode;
  headersType: ts.TypeNode;
  pathParamsType: ts.TypeNode;
  queryParamsType: ts.TypeNode;
  variablesType: ts.TypeNode;
  operation: OperationObject;
  fetcherFn: string;
  url: string;
  verb: string;
  name: string;
  printNodes: (nodes: ts.Node[]) => string;
}) => {
  const nodes: ts.Node[] = [];
  if (operation.description) {
    nodes.push(f.createJSDocComment(operation.description.trim(), []));
  }

  nodes.push(
    f.createVariableStatement(
      [f.createModifier(ts.SyntaxKind.ExportKeyword)],
      f.createVariableDeclarationList(
        [
          f.createVariableDeclaration(
            f.createIdentifier(name),
            undefined,
            undefined,
            f.createArrowFunction(
              undefined,
              undefined,
              variablesType.kind !== ts.SyntaxKind.VoidKeyword
                ? [
                    f.createParameterDeclaration(
                      undefined,
                      undefined,
                      f.createIdentifier("variables"),
                      undefined,
                      variablesType,
                      undefined
                    ),
                    f.createParameterDeclaration(
                      undefined,
                      undefined,
                      f.createIdentifier("signal"),
                      f.createToken(ts.SyntaxKind.QuestionToken),
                      f.createTypeReferenceNode(
                        f.createIdentifier("AbortSignal")
                      )
                    ),
                  ]
                : [
                    f.createParameterDeclaration(
                      undefined,
                      undefined,
                      f.createIdentifier("signal"),
                      f.createToken(ts.SyntaxKind.QuestionToken),
                      f.createTypeReferenceNode(
                        f.createIdentifier("AbortSignal")
                      )
                    ),
                  ],
              undefined,
              f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              f.createCallExpression(
                f.createIdentifier(fetcherFn),
                [
                  dataType,
                  errorType,
                  requestBodyType,
                  headersType,
                  queryParamsType,
                  pathParamsType,
                ],
                [
                  f.createObjectLiteralExpression(
                    [
                      f.createPropertyAssignment(
                        f.createIdentifier("url"),
                        f.createStringLiteral(camelizedPathParams(url))
                      ),
                      f.createPropertyAssignment(
                        f.createIdentifier("method"),
                        f.createStringLiteral(verb)
                      ),
                      ...(variablesType.kind !== ts.SyntaxKind.VoidKeyword
                        ? [
                            f.createSpreadAssignment(
                              f.createIdentifier("variables")
                            ),
                            f.createShorthandPropertyAssignment(
                              f.createIdentifier("signal")
                            ),
                          ]
                        : [
                            f.createShorthandPropertyAssignment(
                              f.createIdentifier("signal")
                            ),
                          ]),
                      ...createZodValidatorResponse(dataType, printNodes),
                    ],
                    false
                  ),
                ]
              )
            )
          ),
        ],
        ts.NodeFlags.Const
      )
    )
  );
  return nodes;
};
