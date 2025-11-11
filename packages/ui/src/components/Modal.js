"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = void 0;
const react_1 = __importDefault(require("react"));
const react_native_1 = require("react-native");
const colors_1 = require("../theme/colors");
const typography_1 = require("../theme/typography");
const spacing_1 = require("../theme/spacing");
const Modal = ({ visible, onClose, children, title, style, }) => {
    const contentStyle = [styles.content, style].filter(Boolean);
    return (<react_native_1.Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <react_native_1.View style={styles.overlay}>
        <react_native_1.Pressable style={styles.backdrop} onPress={onClose}/>
        <react_native_1.View style={contentStyle}>
          {/* Header */}
          <react_native_1.View style={styles.header}>
            {title && <react_native_1.Text style={styles.title}>{title}</react_native_1.Text>}
            <react_native_1.TouchableOpacity style={styles.closeButton} onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <react_native_1.Text style={styles.closeButtonText}>✕</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>

          {/* Content */}
          <react_native_1.View style={styles.body}>{children}</react_native_1.View>
        </react_native_1.View>
      </react_native_1.View>
    </react_native_1.Modal>);
};
exports.Modal = Modal;
const styles = react_native_1.StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...react_native_1.StyleSheet.absoluteFillObject,
        backgroundColor: colors_1.colors.black,
        opacity: 0.5,
    },
    content: {
        backgroundColor: colors_1.colors.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '90%',
        shadowColor: colors_1.colors.black,
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing_1.spacing.lg,
        paddingTop: spacing_1.spacing.lg,
        paddingBottom: spacing_1.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors_1.colors.gray200,
    },
    title: {
        fontSize: typography_1.fontSizes.xl,
        fontWeight: typography_1.fontWeights.bold,
        color: colors_1.colors.gray900,
        flex: 1,
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors_1.colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: spacing_1.spacing.md,
    },
    closeButtonText: {
        fontSize: typography_1.fontSizes.xl,
        color: colors_1.colors.gray600,
        lineHeight: 24,
    },
    body: {
        padding: spacing_1.spacing.lg,
    },
});
