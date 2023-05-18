export type SortRules = [string, string, string | undefined][];

function parseSortString(sortStr: string): SortRules {
  const regex = /(-?)([^()]+)(?:\((.*)\))*/;

  return sortStr
    .split(',')
    .map((fieldStr) => {
      fieldStr = fieldStr.trim();
      const result = fieldStr.match(regex);
      return result && [result[2], result[1], result[3]];
    })
    .filter(Boolean) as SortRules;
}

export default parseSortString;
