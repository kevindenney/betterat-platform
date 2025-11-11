"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const colors_1 = require("../theme/colors");
const spacing_1 = require("../theme/spacing");
const Card = ({ children, onPress, style }) => {
    const cardStyle = [styles.card, style].filter(Boolean);
    if (onPress) {
        return (<react_native_1.Pressable style={({ pressed }) => [
                cardStyle,
                pressed && styles.pressed,
            ]} onPress={onPress}>
        {children}
      </react_native_1.Pressable>);
    }
    return <react_native_1.View style={cardStyle}>{children}</react_native_1.View>;
};
exports.Card = Card;
const styles = react_native_1.StyleSheet.create({
    card: {
        backgroundColor: colors_1.colors.white,
        borderRadius: 12,
        padding: spacing_1.spacing.md,
        shadowColor: colors_1.colors.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
});
