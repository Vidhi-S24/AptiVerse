import { useTheme } from "../hooks/useTheme";

type AuroraProps = {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
};

// export default function Aurora(props: AuroraProps) {
//   const isDark = useTheme();

//   const darkColors = ["#5227FF", "#7cff67", "#eb41d2"];
//   const lightColors = ["#f78888", "#f8de74", "#98d6f7"];

//   const {
//     colorStops = isDark ? darkColors : lightColors,
//     amplitude = isDark ? 1.0 : 0.7,
//     blend = isDark ? 0.5 : 0.7,
//     time = 0,
//     speed = 1.0,
//   } = props;

//     return (
//     <div className="aurora-container">
//       <div className="aurora-glow" />
//     </div>
//   );
// }

export default function Aurora(props: AuroraProps) {
  const isDark = useTheme();

  const darkColors = ["#5227FF", "#7cff67", "#eb41d2"];
  const lightColors = ["#e38f50", "#df63c7", "#85e466"];

  const {
    colorStops = isDark ? darkColors : lightColors,
    amplitude = isDark ? 1.0 : 0.7,
    blend = isDark ? 0.5 : 0.7,
    speed = 1.0,
  } = props;

  return (
    <div className="aurora-container">
      <div
        className="aurora-glow"
        style={{
          "--c1": colorStops[0],
          "--c2": colorStops[1],
          "--c3": colorStops[2],
          "--speed": `${10 / speed}s`,
          "--blur": `${120 * amplitude}px`,
          "--opacity": blend,
        } as React.CSSProperties}
      />
    </div>
  );
}