import { generatePath } from "react-router-dom";

export class Resolver {
  resolve(data) {
    return (rowData) => {
      // this is so all links to details will prefix "/gha/"
      return "/gha/" + generatePath(data.path, rowData);
    };
  }
}

export function getOrCreateGlobalSingleton<T>(
  id: string,
  supplier: () => T
): T {
  const key = makeKey(id);

  let value = globalObject[key];
  if (value) {
    return value;
  }

  value = supplier();
  globalObject[key] = value;
  return value;
}

function getGlobalObject() {
  if (typeof window !== "undefined" && window.Math === Math) {
    return window;
  }
  // eslint-disable-next-line no-new-func
  return Function("return this")();
}

const globalObject = getGlobalObject();

const makeKey = (id: string) => `__@backstage/${id}__`;
