"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const Input = ({ label, value, onChangeText, placeholder, error, type = 'text', style, disabled = false, }) => {
    const getKeyboardType = () => {
        switch (type) {
            case 'email':
                return 'email-address';
            case 'number':
                return 'numeric';
            default:
                return 'default';
        }
    };
    const containerStyle = [styles.container, style].filter(Boolean);
    const inputStyle = [
        styles.input,
        error && styles.inputError,
        disabled && styles.inputDisabled,
    ].filter(Boolean);
    return (<react_native_1.View style={containerStyle}>
      <react_native_1.Text style={styles.label}>{label}</react_native_1.Text>
      <react_native_1.TextInput style={inputStyle} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors_1.colors.gray400} secureTextEntry={type === 'password'} keyboardType={getKeyboardType()} autoCapitalize={type === 'email' ? 'none' : 'sentences'} editable={!disabled}/>
      {error && <react_native_1.Text style={styles.errorText}>{error}</react_native_1.Text>}
    </react_native_1.View>);
};
exports.Input = Input;
const styles = react_native_1.StyleSheet.create({
    container: {
        marginBottom: spacing_1.spacing.md,
    },
    label: {
        fontSize: typography_1.fontSizes.sm,
        fontWeight: typography_1.fontWeights.medium,
        color: colors_1.colors.gray700,
        marginBottom: spacing_1.spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors_1.colors.gray300,
        borderRadius: 8,
        paddingVertical: spacing_1.spacing.sm,
        paddingHorizontal: spacing_1.spacing.md,
        fontSize: typography_1.fontSizes.base,
        color: colors_1.colors.gray900,
        backgroundColor: colors_1.colors.white,
        minHeight: 48,
    },
    inputError: {
        borderColor: colors_1.colors.error,
    },
    inputDisabled: {
        backgroundColor: colors_1.colors.gray100,
        color: colors_1.colors.gray500,
    },
    errorText: {
        fontSize: typography_1.fontSizes.xs,
        color: colors_1.colors.error,
        marginTop: spacing_1.spacing.xs,
    },
});
