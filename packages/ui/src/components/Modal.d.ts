import React from 'react';
import { ViewStyle } from 'react-native';
export interface ModalProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
    style?: ViewStyle;
}
export declare const Modal: React.FC<ModalProps>;
//# sourceMappingURL=Modal.d.ts.map