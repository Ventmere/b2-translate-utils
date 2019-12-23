import * as huz from "./huz";
export interface IParseTagsResult {
    content: string;
    tags: ITag[];
    warnings: ITagWarning[];
}
export declare function parseTags(parseResult: huz.IParseResult): IParseTagsResult;
export declare function applyTags(result: IParseTagsResult): string;
export interface ITag {
    id: string;
    isNew: boolean;
    element: huz.Element;
    content: string;
}
export interface ITagWarning {
    line: number;
    range: [number, number];
    message: string;
}
