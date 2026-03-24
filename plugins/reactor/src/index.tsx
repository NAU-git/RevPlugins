import { after } from "@vendetta/patcher";
import { React, ReactNative } from "@vendetta/metro/common";
import { findByProps, findByStoreName } from "@vendetta/metro";

const { View, Animated, Dimensions, Easing, Image, StyleSheet } = ReactNative;
const { width: SW, height: SH } = Dimensions.get("window");

const SelectedChannelStore = findByStoreName("SelectedChannelStore");
const MessageStore = findByProps("addReaction");
const FluxDispatcher = findByProps("dispatch", "subscribe");
const GeneralModule = findByProps("View");

const IMG_CONFETTI = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/confetti.png";
const IMG_HEART = "https://raw.githubusercontent.com/NAU-git/RevPlugins/refs/heads/master/plugins/reactor/src/particles/heart.png";

const PARTY_COLORS = ["#D8B4FE", "#86EFAC", "#F9A8D4", "#93C5FD", "#FDE68A", "#F87171"];
const PARTY_EMOJIS = ["🎉", "🎊", "🪅", "🎂"];
const HEART_MAP = {
  "💚": "#22C55E",
  "💙": "#3B82F6",
  "🤍": "#FFFFFF",
  "🧡": "#F97316",
  "❤️": "#EF4444",
  "🖤": "#000000",
  "🤎": "#78350F",
  "💛": "#EAB308",
  "💜": "#A855F7"
};

let patches = [];
let lastBurst = 0;
let sT = null;
let fT = null;
let aID = null;
let activeType = "party";
let activeColor = "#EF4444";

const gO = new Animated.Value(0);
const P_COUNT = 30;
const P_POOL = Array.from({ length: P_COUNT }, () => ({
  x: Math.random() * SW,
  s: 15 + Math.random() * 10,
  d: 3000 + Math.random() * 1000,
  o: 0.6 + Math.random() * 0.4,
  iD: Math.random() * 2000,
  rS: Math.random() * 360,
  rD: (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720),
  hS: 30 + Math.random() * 50
}));

const Particle = ({ i, type, color }) => {
  const d = P_POOL[i];
  const aV = React.useRef(new Animated.Value(0)).current;
  const hV = React.useRef(new Animated.Value(0)).current;
  const rV = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    let m = true;
    const isH = type === "heart";

    const run = (delay = 0) => {
      if (!m) return;
      aV.setValue(0);
      hV.setValue(0);
      rV.setValue(0);

      Animated.parallel([
        Animated.timing(aV, {
          toValue: 1,
          duration: d.d,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.timing(rV, {
          toValue: 1,
          duration: d.d,
          delay: delay,
          useNativeDriver: true,
          easing: Easing.linear
        }),
        Animated.sequence([
          Animated.timing(hV, {
            toValue: 1,
            duration: d.d / 2,
            delay: delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          }),
          Animated.timing(hV, {
            toValue: 0,
            duration: d.d / 2,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.sin)
          })
        ])
      ]).start(({ finished }) => {
        if (finished && m) run(0);
      });
    };

    run(d.iD);
    return () => {
      m = false;
      aV.stopAnimation();
      hV.stopAnimation();
      rV.stopAnimation();
    };
  }, [type]);

  const isH = type === "heart";
  
  const tY = aV.interpolate({
    inputRange: [0, 1],
    outputRange: [isH ? SH + 50 : -100, isH ? -100 : SH + 100]
  });

  const hX = hV.interpolate({
    inputRange: [0, 1],
    outputRange: [0, d.hS]
  });

  const rot = rV.interpolate({
    inputRange: [0, 1],
    outputRange: [`${d.rS}deg`, `${d.rS + (isH ? 0 : d.rD)}deg`]
  });

  const opac = aV.interpolate({
    inputRange: [0, 0.1, 0.9, 1],
    outputRange: [0, d.o, d.o, 0]
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: d.x,
        top: 0,
        width: d.s,
        height: d.s,
        opacity: isH ? opac : d.o,
        transform: [{ translateY: tY }, { translateX: hX }, { rotate: rot }]
      }}
    >
      <Image
        source={{ uri: isH ? IMG_HEART : IMG_CONFETTI }}
        style={{
          width: '100%',
          height: '100%',
          tintColor: isH ? color : PARTY_COLORS[i % PARTY_COLORS.length]
        }}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const Overlay = () => {
  const [, fU] = React.useReducer(x => x + 1, 0);
  const currentChannel = SelectedChannelStore?.getChannelId();

  React.useEffect(() => {
    const i = setInterval(() => fU(), 500);
    return () => clearInterval(i);
  }, []);

  React.useEffect(() => {
    if (currentChannel !== aID && aID !== null) {
      Animated.timing(gO, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true
      }).start(() => {
        aID = null;
        if (sT) clearTimeout(sT);
        if (fT) clearTimeout(fT);
      });
    }
  }, [currentChannel]);

  if (currentChannel !== aID) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, { zIndex: 9999, opacity: gO }]}
    >
      {P_POOL.map((_, i) => (
        <Particle key={`${activeType}-${i}`} i={i} type={activeType} color={activeColor} />
      ))}
    </Animated.View>
  );
};

const trigger = (cid, emo) => {
  const name = emo?.name || emo?.id;
  if (!name || Date.now() - lastBurst < 4000) return;

  if (HEART_MAP[name] || PARTY_EMOJIS.includes(name)) {
    lastBurst = Date.now();
    aID = cid;
    activeType = HEART_MAP[name] ? "heart" : "party";
    if (HEART_MAP[name]) activeColor = HEART_MAP[name];

    gO.setValue(1);
    if (sT) clearTimeout(sT);
    if (fT) clearTimeout(fT);

    fT = setTimeout(() => {
      Animated.timing(gO, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.linear
      }).start();
    }, 4000);

    sT = setTimeout(() => {
      aID = null;
    }, 5500);
  }
};

export default {
  onLoad: () => {
    if (MessageStore) {
      patches.push(after("addReaction", MessageStore, (args) => trigger(args[0], args[2])));
    }
    
    if (FluxDispatcher) {
      const handleDispatch = (e) => trigger(e.channelId, e.emoji);
      FluxDispatcher.subscribe("MESSAGE_REACTION_ADD", handleDispatch);
      patches.push(() => FluxDispatcher.unsubscribe("MESSAGE_REACTION_ADD", handleDispatch));
    }

    if (GeneralModule?.View) {
      patches.push(after("render", GeneralModule.View, (a, res) => {
        if (res?.props && StyleSheet.flatten(res.props.style)?.flex === 1 && res.props.onLayout && !React.Children.toArray(res.props.children).some(c => c?.key === "reactor-v20")) {
          res.props.children = [
            ...React.Children.toArray(res.props.children),
            React.createElement(Overlay, { key: "reactor-v20" })
          ];
        }
        return res;
      }));
    }
  },
  onUnload: () => {
    patches.forEach(p => p?.());
    clearTimeout(sT);
    clearTimeout(fT);
    aID = null;
    gO.setValue(0);
  }
};
