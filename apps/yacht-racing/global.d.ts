declare module '*.css';

declare const window: any;
declare const document: any;
declare const alert: (...args: any[]) => void;

declare namespace React {
  interface Attributes {
    className?: string;
  }
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicAttributes {
        className?: string;
      }
    }
  }
}

declare module 'lucide-react-native' {
  interface LucideProps {
    className?: string;
  }
}
