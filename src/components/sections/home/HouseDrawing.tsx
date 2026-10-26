/**
 * Hand-drawn architectural elevation of a two-storey modern coastal house, split into the
 * three construction layers used by the Foundation Up story. Every stroke uses pathLength=1 so
 * one dash value (0 → 1) draws any line regardless of its real length.
 *
 * `stage` controls which layers are drawn when rendered statically (reduced motion grid):
 * 1 = concrete, 2 = + framing, 3 = + envelope. The animated version controls dash offsets itself.
 */

const GROUND = 600;
const W1 = { l: 180, r: 1020 }; // first floor walls
const W2 = { l: 300, r: 940 }; // second floor walls (set back on the deck side)
const F1 = { top: 425 }; // first-floor top plate
const F2 = { bottom: 410, top: 255 };

function range(from: number, to: number, step: number) {
  const out: number[] = [];
  for (let x = from; x <= to + 0.1; x += step) out.push(Math.round(x * 10) / 10);
  return out;
}

const L = { pathLength: 1, vectorEffect: "non-scaling-stroke" as const };

export function ConcreteLayer() {
  const hatch = range(W1.l - 30, W1.r + 10, 22);
  return (
    <g data-layer="1" className="stroke-current" fill="none">
      {/* grade line */}
      <path {...L} d={`M40 ${GROUND} H1160`} strokeWidth="1.5" />
      {/* continuous footing + slab */}
      <path
        {...L}
        d={`M${W1.l - 30} ${GROUND + 10} H${W1.r + 30} V${GROUND + 70} H${W1.l - 30} Z`}
        strokeWidth="1.5"
      />
      <path {...L} d={`M${W1.l} ${GROUND} V${GROUND - 14} H${W1.r} V${GROUND}`} strokeWidth="2.5" />
      {/* interior pad footings */}
      {[420, 600, 780].map((x) => (
        <path
          key={x}
          {...L}
          d={`M${x - 40} ${GROUND + 10} V${GROUND + 95} H${x + 40} V${GROUND + 10}`}
          strokeWidth="1.25"
        />
      ))}
      {/* rebar */}
      <path {...L} d={`M${W1.l - 15} ${GROUND + 55} H${W1.r + 15}`} strokeWidth="1" />
      <path {...L} d={`M${W1.l - 15} ${GROUND + 25} H${W1.r + 15}`} strokeWidth="1" />
      {/* concrete hatch */}
      {hatch.map((x) => (
        <path
          key={x}
          {...L}
          d={`M${x} ${GROUND + 70} L${x + 20} ${GROUND + 12}`}
          strokeWidth="0.75"
          opacity="0.5"
        />
      ))}
    </g>
  );
}

export function FramingLayer() {
  const studs1 = range(W1.l, W1.r, 40);
  const studs2 = range(W2.l, W2.r, 40);
  const joists = range(W1.l - 20, W1.r + 60, 60);
  return (
    <g data-layer="2" className="stroke-current" fill="none">
      {/* first floor studs */}
      {studs1.map((x) => (
        <path key={`a${x}`} {...L} d={`M${x} ${GROUND - 14} V${F1.top}`} strokeWidth="1.25" />
      ))}
      {/* plates */}
      <path {...L} d={`M${W1.l} ${F1.top} H${W1.r}`} strokeWidth="2" />
      <path {...L} d={`M${W1.l} ${F1.top - 5} H${W1.r}`} strokeWidth="2" />
      {/* floor system */}
      <path {...L} d={`M${W1.l - 20} ${F2.bottom} H${W1.r + 60}`} strokeWidth="2" />
      {joists.map((x) => (
        <path key={`j${x}`} {...L} d={`M${x} ${F1.top - 5} V${F2.bottom}`} strokeWidth="1" />
      ))}
      {/* second floor studs */}
      {studs2.map((x) => (
        <path key={`b${x}`} {...L} d={`M${x} ${F2.bottom} V${F2.top}`} strokeWidth="1.25" />
      ))}
      <path {...L} d={`M${W2.l} ${F2.top} H${W2.r}`} strokeWidth="2" />
      <path {...L} d={`M${W2.l} ${F2.top - 5} H${W2.r}`} strokeWidth="2" />
      {/* let-in bracing */}
      <path {...L} d={`M${W1.l} ${GROUND - 14} L${W1.l + 160} ${F1.top}`} strokeWidth="1.25" />
      <path {...L} d={`M${W1.r} ${GROUND - 14} L${W1.r - 160} ${F1.top}`} strokeWidth="1.25" />
      <path {...L} d={`M${W2.r} ${F2.bottom} L${W2.r - 140} ${F2.top}`} strokeWidth="1.25" />
      {/* headers over openings */}
      <path {...L} d={`M380 ${F1.top + 30} H700`} strokeWidth="3" />
      <path {...L} d={`M560 ${F2.top + 25} H900`} strokeWidth="3" />
      {/* roof joists, slight overhang */}
      <path {...L} d={`M${W2.l - 50} ${F2.top - 22} H${W2.r + 70}`} strokeWidth="2" />
      {range(W2.l - 40, W2.r + 60, 50).map((x) => (
        <path key={`r${x}`} {...L} d={`M${x} ${F2.top - 5} V${F2.top - 22}`} strokeWidth="1" />
      ))}
    </g>
  );
}

export function EnvelopeLayer() {
  return (
    <g data-layer="3" className="stroke-current" fill="none">
      {/* wall sheathing outlines */}
      <path
        {...L}
        d={`M${W1.l - 6} ${GROUND - 14} V${F2.bottom - 4} H${W1.r + 6} V${GROUND - 14}`}
        strokeWidth="2.25"
      />
      <path
        {...L}
        d={`M${W2.l - 6} ${F2.bottom - 4} V${F2.top - 4} H${W2.r + 6} V${F2.bottom - 4}`}
        strokeWidth="2.25"
      />
      {/* cantilevered roof slab */}
      <path
        {...L}
        d={`M${W2.l - 90} ${F2.top - 22} H${W2.r + 110} V${F2.top - 40} H${W2.l - 90} Z`}
        strokeWidth="2.5"
      />
      {/* second floor deck + glass rail */}
      <path {...L} d={`M${W1.l - 40} ${F2.bottom - 4} H${W2.l}`} strokeWidth="2.5" />
      <path
        {...L}
        d={`M${W1.l - 40} ${F2.bottom - 4} V${F2.bottom - 52} H${W2.l - 6}`}
        strokeWidth="1.25"
      />
      {/* first floor glazing (sliders) */}
      <path
        {...L}
        d={`M380 ${GROUND - 14} V${F1.top + 30} H700 V${GROUND - 14}`}
        strokeWidth="1.5"
      />
      {[460, 540, 620].map((x) => (
        <path key={x} {...L} d={`M${x} ${GROUND - 14} V${F1.top + 30}`} strokeWidth="1" />
      ))}
      {/* entry door */}
      <path
        {...L}
        d={`M800 ${GROUND - 14} V${F1.top + 30} H860 V${GROUND - 14}`}
        strokeWidth="1.5"
      />
      {/* second floor window wall */}
      <path
        {...L}
        d={`M560 ${F2.bottom - 4} V${F2.top + 25} H900 V${F2.bottom - 4}`}
        strokeWidth="1.5"
      />
      {[645, 730, 815].map((x) => (
        <path key={x} {...L} d={`M${x} ${F2.bottom - 4} V${F2.top + 25}`} strokeWidth="1" />
      ))}
      {/* clerestory window */}
      <path {...L} d={`M340 ${F2.top + 40} H500 V${F2.top + 90} H340 Z`} strokeWidth="1.5" />
      {/* horizontal siding courses on first floor end */}
      {[460, 490, 520, 550].map((y) => (
        <path key={y} {...L} d={`M${W1.l - 6} ${y} H360`} strokeWidth="0.75" opacity="0.6" />
      ))}
      {/* landscaping line */}
      <path
        {...L}
        d={`M60 ${GROUND} C140 ${GROUND - 40}, 170 ${GROUND - 40}, 200 ${GROUND}`}
        strokeWidth="1"
      />
      <path
        {...L}
        d={`M1030 ${GROUND} C1070 ${GROUND - 55}, 1110 ${GROUND - 55}, 1140 ${GROUND}`}
        strokeWidth="1"
      />
    </g>
  );
}

export function HouseDrawing({
  stage = 3,
  className,
  title,
}: {
  stage?: 1 | 2 | 3;
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 1200 720"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      strokeLinecap="square"
    >
      <ConcreteLayer />
      {stage >= 2 && <FramingLayer />}
      {stage >= 3 && <EnvelopeLayer />}
    </svg>
  );
}
