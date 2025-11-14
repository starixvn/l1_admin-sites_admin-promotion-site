// Pipe function for functional composition
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T => 
  fns.reduce((acc, fn) => fn(acc), value);

// Helper to conditionally append params - returns a function that takes params and returns params
export const appendIf = <T>(
  value: T,
  condition: (value: T) => boolean,
  key: string,
  transform: (value: T) => string
) => (params: URLSearchParams): URLSearchParams => {
  if (condition(value)) {
    params.append(key, transform(value));
  }
  return params;
};

// Helper to conditionally assign object properties - returns a function that takes object and returns object
export const assignIf = <T, V>(
  value: V,
  condition: (value: V) => boolean,
  key: string,
  transform: (value: V) => T = (v) => v as unknown as T
) => (obj: Record<string, any>): Record<string, any> => {
  if (condition(value)) {
    obj[key] = transform(value);
  }
  return obj;
};

