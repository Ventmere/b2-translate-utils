import * as parse5 from "parse5";
export declare type TextNode = parse5.DefaultTreeTextNode;
export declare type Element = parse5.DefaultTreeElement;
export declare type Node = Element | TextNode;
export declare type Root = {
    childNodes: Node[];
};
export interface IParseResult {
    content: string;
    htmlRoot: Root;
    handles: string[];
}
export interface IPlaceholder {
    char: string;
    offset: number;
}
export declare function parse(content: string): IParseResult;
export declare function serialize(node: parse5.Node): string;
export declare function searchAll<T>(str: string, re: RegExp, extract: (index: number, length: number, captures: string[]) => T): T[];
