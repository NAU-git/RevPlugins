import { after } from "@vendetta/patcher";
import { findByProps, findByName } from "@vendetta/metro";
import { React, ReactNative } from "@vendetta/metro/common";

const { Image, StyleSheet } = ReactNative;

// The color constants based on your list
const TRANSPARENT = "transparent";
const OVERLAY_DARK = "rgba(0, 0, 0, 0.4)";
const BG_URL = "https://raw.githubusercontent.com/n0t-a-username/revenge-themes/refs/heads/main/Images/DiscordLink.jpg";

// Metro Modules
const ThemeStore = findByProps("theme");
const SemanticColor = findByProps("SemanticColor"); // Used for semantic color overrides

const BackgroundElement = () => (
    <Image 
        source={{ uri: BG_URL }} 
        style={[StyleSheet.absoluteFill, { zIndex: -1 }]} 
        resizeMode="cover" 
    />
);

let patches: Function[] = [];

export default { 
    onLoad: () => { 
        // 1. Inject the Background Image
        const AppBackground = findByName("AppBackground", false);
        if (AppBackground) {
            patches.push(after("default", AppBackground, (_args, res) => {
                if (!res?.props) return res;
                const children = res.props.children;
                if (Array.isArray(children) && !children.some((c: any) => c?.key === "custom-bg")) {
                    children.unshift(<BackgroundElement key="custom-bg" />);
                }
                res.props.style = [res.props.style, { backgroundColor: "transparent" }];
                return res;
            }));
        }

        // 2. Patch Semantic Colors (The "Theme Keys" you listed)
        // This intercepts the app's request for specific colors
        if (SemanticColor?.default?.colors) {
            const colorOverwrites: Record<string, string> = {
                CARD_BACKGROUND_DEFAULT: OVERLAY_DARK,
                MESSAGE_HIGHLIGHT_BACKGROUND_DEFAULT: "rgba(255, 255, 255, 0.1)",
                BACKGROUND_SURFACE_HIGH: OVERLAY_DARK,
                PLUM_23: TRANSPARENT, // Server list background
                MESSAGE_MENTIONED_BACKGROUND_DEFAULT: "rgba(250, 166, 26, 0.15)",
                MOBILE_ANDROID_BUTTON_BACKGROUND_RIPPLE: "rgba(255, 255, 255, 0.1)",
                // For text colors, you usually target the PRIMARY keys
                MOBILE_TEXT_HEADING_PRIMARY: "#FFFFFF", 
            };

            // We patch the color getter
            patches.push(after("resolveSemanticColor", SemanticColor.default, (args, res) => {
                const colorKey = args[1]; // The name of the color being requested
                if (colorOverwrites[colorKey]) {
                    return colorOverwrites[colorKey];
                }
                return res;
            }));
        }
    }, 
    onUnload: () => { 
        patches.forEach(unpatch => unpatch?.()); 
    } 
};
