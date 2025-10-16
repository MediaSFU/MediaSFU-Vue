declare module 'react' {
  export interface CSSProperties {
    [key: string]: string | number | undefined;
  }

  export type ReactElement = any;

  export interface FC<P = {}> {
    (props: P): ReactElement | null;
  }
}
