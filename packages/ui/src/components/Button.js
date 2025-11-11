"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const Button = ({ title, onPress, variant = 'primary', disabled = false, style, }) => {
    const buttonStyle = [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        disabled && styles.disabled,
        style,
    ].filter(Boolean);
    const textStyle = [
        styles.text,
        variant === 'primary' && styles.primaryText,
        variant === 'secondary' && styles.secondaryText,
        variant === 'outline' && styles.outlineText,
        disabled && styles.disabledText,
    ].filter(Boolean);
    return (<react_native_1.TouchableOpacity style={buttonStyle} onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      <react_native_1.Text style={textStyle}>{title}</react_native_1.Text>
    </react_native_1.TouchableOpacity>);
};
exports.Button = Button;
const styles = react_native_1.StyleSheet.create({
    base: {
        paddingVertical: spacing_1.spacing.md,
        paddingHorizontal: spacing_1.spacing.lg,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 48,
    },
    primary: {
        backgroundColor: colors_1.colors.primary,
    },
    secondary: {
        backgroundColor: colors_1.colors.gray200,
    },
    outline: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: colors_1.colors.primary,
    },
    disabled: {
        backgroundColor: colors_1.colors.gray300,
        opacity: 0.6,
    },
    text: {
        fontSize: typography_1.fontSizes.base,
        fontWeight: typography_1.fontWeights.semibold,
        textAlign: 'center',
    },
    primaryText: {
        color: colors_1.colors.white,
    },
    secondaryText: {
        color: colors_1.colors.gray900,
    },
    outlineText: {
        color: colors_1.colors.primary,
    },
    disabledText: {
        color: colors_1.colors.gray500,
    },
});
