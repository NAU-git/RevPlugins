import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps, findByStoreName } from "@vendetta/metro";

const { View, Animated, Dimensions, Easing, Image, StyleSheet } = ReactNative;
const { width: SW, height: SH } = Dimensions.get("window");

const SelectedChannelStore = findByStoreName("SelectedChannelStore"),
      MessageStore = findByProps("addReaction"),
      FluxDispatcher = findByProps("dispatch", "subscribe"),
      GeneralModule = findByProps("View");

const COLORS = ["#D8B4FE", "#86EFAC", "#F9A8D4", "#93C5FD", "#FDE68A", "#F87171"],
      IMG_CONFETTI = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/confetti.png",
      IMG_HEART = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/heart.png",
      IMG_STAR = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/fallingstar.png",
      IMG_TRAIL = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/startrail.png";

const HEART_MAP = { "💚": "#22C55E", "💙": "#3B82F6", "🤍": "#FFFFFF", "🧡": "#F97316", "❤️": "#EF4444", "🖤": "#000000", "🤎": "#78350F", "💛": "#EAB308", "💜": "#A855F7" };
const PARTY_EMOJIS = ["🎉", "🎊", "🪅", "🎂"];
const STAR_EMOJIS = ["⭐", "🌟", "✨", "🌠"];

let patches = [], lastBurst = 0, sT = null, fT = null, aID = null, activeType = "party", activeColor = "#EF4444";

const gO = new Animated.Value(0), 
      P_COUNT = 20, 
      P_POOL = Array.from({ length: P_COUNT }, () => ({ 
        x: (Math.random() * 1.1 - 0.05) * SW, 
        s: 12 + Math.random() * 8, 
        d: 2000 + Math.random() * 1500, 
        hd: 6000 + Math.random() * 2000,
        sd: 2800 + Math.random() * 800, // Slower movement
        o: 0.8 + Math.random() * 0.2, 
        iD: Math.random() * 2000, 
        c: COLORS[Math.floor(Math.random() * COLORS.length)], 
        rS: Math.random() * 360, 
        rD: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720), 
        hS: (Math.random() - 0.5) * 40,
        hStep: 45 + Math.random() * 55,
        // Spawn strictly on the LEFT side (X: -20 to 20) and spread across Y
        spawnX: (Math.random() * 40) - 20,
        spawnY: (Math.random() * (SH * 0.8)) - 50,
        trailGap: 8 + Math.random() * 6 // Spacing the trail away
      }));

const Particle = ({ i }) => { 
    const d = P_POOL[i], aV = React.useRef(new Animated.Value(-100)).current, rV = React.useRef(new Animated.Value(0)).current, hV = React.useRef(new Animated.Value(0)).current; 
    React.useEffect(() => { 
        let m = true; 
        const r = (dy = 0) => { 
            if (!m) return; 
            aV.setValue(-100); rV.setValue(0); hV.setValue(0); 
            Animated.parallel([
                Animated.timing(aV, { toValue: SH + 100, duration: d.d, delay: dy, useNativeDriver: true, easing: Easing.linear }), 
                Animated.timing(rV, { toValue: 1, duration: d.d, delay: dy, useNativeDriver: true, easing: Easing.linear }), 
                Animated.sequence([
                    Animated.timing(hV, { toValue: 1, duration: d.d / 2, delay: dy, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }), 
                    Animated.timing(hV, { toValue: 0, duration: d.d / 2, useNativeDriver: true, easing: Easing.inOut(Easing.sin) })
                ])
            ]).start(({ finished }) => { if (finished && m) r(0); }); 
        }; 
        r(d.iD); 
        return () => { m = false; aV.stopAnimation(); rV.stopAnimation(); hV.stopAnimation(); }; 
    }, []); 
    const rot = rV.interpolate({ inputRange: [0, 1], outputRange: [`${d.rS}deg`, `${d.rS + d.rD}deg`] }), hX = hV.interpolate({ inputRange: [0, 1], outputRange: [0, d.hS] }); 
    return <Animated.View style={{ position: "absolute", left: d.x, top: 0, width: d.s, height: d.s, opacity: d.o, transform: [{ translateY: aV }, { translateX: hX }, { rotate: rot }] }}><Image source={{ uri: IMG_CONFETTI }} style={{ width: '100%', height: '100%', tintColor: d.c }} resizeMode="contain" /></Animated.View>; 
};

const HeartParticle = ({ i }) => {
    const d = P_POOL[i], aV = React.useRef(new Animated.Value(SH + 50)).current, hV = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        let m = true;
        const r = (dy = 0) => {
            if (!m) return;
            aV.setValue(SH + 50); hV.setValue(0);
            Animated.parallel([
                Animated.timing(aV, { toValue: -150, duration: d.hd, delay: dy, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
                Animated.sequence([
                    Animated.timing(hV, { toValue: 1, duration: d.hd / 8, delay: dy, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(hV, { toValue: -1, duration: d.hd / 4, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(hV, { toValue: 1, duration: d.hd / 4, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(hV, { toValue: -1, duration: d.hd / 4, useNativeDriver: true, easing: Easing.inOut(Easing.sin) }),
                    Animated.timing(hV, { toValue: 0, duration: d.hd / 8, useNativeDriver: true, easing: Easing.inOut(Easing.sin) })
                ])
            ]).start(({ finished }) => { if (finished && m) r(0); });
        };
        r(d.iD);
        return () => { m = false; aV.stopAnimation(); hV.stopAnimation(); };
    }, []);
    const hX = hV.interpolate({ inputRange: [-1, 1], outputRange: [-d.hStep, d.hStep] }), 
          opac = aV.interpolate({ inputRange: [-100, 50, SH - 50, SH + 50], outputRange: [0, d.o, d.o, 0] });
    return <Animated.View style={{ position: "absolute", left: d.x, top: 0, width: d.s, height: d.s, opacity: opac, transform: [{ translateY: aV }, { translateX: hX }] }}><Image source={{ uri: IMG_HEART }} style={{ width: '100%', height: '100%', tintColor: activeColor }} resizeMode="contain" /></Animated.View>;
};

const StarParticle = ({ i }) => {
    const d = P_POOL[i], anim = React.useRef(new Animated.Value(0)).current;
    React.useEffect(() => {
        let m = true;
        const r = (dy = 0) => {
            if (!m) return;
            anim.setValue(0);
            Animated.timing(anim, { 
                toValue: 1, 
                duration: d.sd, 
                delay: dy, 
                useNativeDriver: true, 
                easing: Easing.bezier(0.2, 0.9, 0.4, 1) 
            }).start(({ finished }) => { if (finished && m) r(0); });
        };
        r(d.iD);
        return () => { m = false; anim.stopAnimation(); };
    }, []);

    // Streaking from the left side toward the right
    const tX = anim.interpolate({ inputRange: [0, 1], outputRange: [d.spawnX, SW + 100] });
    const tY = anim.interpolate({ inputRange: [0, 1], outputRange: [d.spawnY, d.spawnY + (SH * 0.4)] });
    
    const rot = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

    // Removed fade-in: starts at solid 1 opacity immediately
    const opac = anim.interpolate({ 
        inputRange: [0, 0.8, 1], 
        outputRange: [1, 1, 0] 
    });

    return (
        <Animated.View style={{ 
            position: "absolute", 
            left: 0, 
            top: 0, 
            width: d.s * 1.6, 
            height: d.s * 1.6, 
            opacity: opac, 
            transform: [{ translateX: tX }, { translateY: tY }] 
        }}>
            {/* Trail: Offset further away using trailGap and pointed CCW */}
            <Image 
                source={{ uri: IMG_TRAIL }} 
                style={{ 
                    position: "absolute", 
                    left: -d.trailGap, 
                    top: -d.trailGap, 
                    width: '100%', 
                    height: '100%', 
                    transform: [{ rotate: '-45deg' }] 
                }} 
                resizeMode="contain" 
            />
            <Animated.Image 
                source={{ uri: IMG_STAR }} 
                style={{ 
                    width: '100%', 
                    height: '100%', 
                    tintColor: "#DAA520", 
                    transform: [{ rotate: rot }] 
                }} 
                resizeMode="contain" 
            />
        </Animated.View>
    );
};

const Overlay = () => { 
    const [, fU] = React.useReducer(x => x + 1, 0); 
    React.useEffect(() => { const i = setInterval(() => fU(), 200); return () => clearInterval(i); }, []); 
    React.useEffect(() => { 
        if (SelectedChannelStore?.getChannelId() !== aID && aID !== null) { 
            Animated.timing(gO, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => { aID = null; if (sT) clearTimeout(sT); if (fT) clearTimeout(fT); }); 
        } 
    }, [SelectedChannelStore?.getChannelId()]); 

    if (SelectedChannelStore?.getChannelId() !== aID) return null; 
    return (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { zIndex: 999, opacity: gO }]}>
            {P_POOL.map((_, i) => {
                if (activeType === "shooting_star") return <StarParticle key={i} i={i} />;
                if (activeType === "heart") return <HeartParticle key={i} i={i} />;
                return <Particle key={i} i={i} />;
            })}
        </Animated.View>
    ); 
};

const trigger = (cid, emo) => { 
    const name = emo?.name || emo?.id;
    if (!name || Date.now() - lastBurst < 4000) return;

    if (HEART_MAP[name] || PARTY_EMOJIS.includes(name) || STAR_EMOJIS.includes(name)) {
        lastBurst = Date.now(); 
        aID = cid; 
        if (STAR_EMOJIS.includes(name)) activeType = "shooting_star";
        else activeType = HEART_MAP[name] ? "heart" : "party";
        if (HEART_MAP[name]) activeColor = HEART_MAP[name];

        gO.setValue(1); 
        if (sT) clearTimeout(sT); if (fT) clearTimeout(fT); 
        fT = setTimeout(() => Animated.timing(gO, { toValue: 0, duration: 1000, useNativeDriver: true, easing: Easing.linear }).start(), 4350); 
        sT = setTimeout(() => aID = null, 5500); 
    }
}; 

export default { 
    onLoad: () => { 
        if (MessageStore) patches.push(after("addReaction", MessageStore, (args) => trigger(args[0], args[2]))); 
        if (FluxDispatcher) FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", (e) => trigger(e.channelId, e.emoji)); 
        if (GeneralModule?.View) patches.push(after("render", GeneralModule.View, (a, res) => { 
            if (res?.props && StyleSheet.flatten(res.props.style)?.flex === 1 && res.props.onLayout && !React.Children.toArray(res.props.children).some(c => c?.key === "reactor-vLeftSpawn")) { 
                res.props.children = [...React.Children.toArray(res.props.children), React.createElement(Overlay, { key: "reactor-vLeftSpawn" })]; 
            } 
            return res; 
        })); 
    }, 
    onUnload: () => { 
        patches.forEach(p => p?.()); 
        clearTimeout(sT); clearTimeout(fT); aID = null; 
    } 
};
