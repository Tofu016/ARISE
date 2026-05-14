import React, { useMemo, useState } from 'react';
import {
  ViroARScene,
  ViroPolyline,
  ViroAmbientLight,
  ViroMaterials,
  ViroTrackingStateConstants,
} from '@reactvision/react-viro';

/**
 * ─── ARISE CALIBRATION ──────────────────────────────────────────────────────
 * MAIN_SCALE:    0.54 (Based on 18 steps per 25-unit interval)
 * DIGITAL_SCALE: 0.60 (Based on 16 steps per 25-unit interval)
 * VERTICAL_SCALE: 0.14 (3.5m floor height / 25 units)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const MAIN_HORIZONTAL_SCALE = 0.54;
const DIGITAL_HORIZONTAL_SCALE = 0.60;
const VERTICAL_SCALE = 0.14;

export const NavigationScene = (props) => {
  // ── Tracking State: Prevents the "snapping" jump by waiting for stability ──
  const [trackingState, setTrackingState] = useState(
    ViroTrackingStateConstants.TRACKING_UNAVAILABLE
  );

  const {
    path,
    lineColor,
    yOffset,
    startNode,
  } = props.sceneNavigator.viroAppProps;

  // Update material only when the live color changes from the Firebase Tunnel
  useMemo(() => {
    ViroMaterials.createMaterials({
      universityRed: {
        diffuseColor: lineColor || '#B22222',
        lightingModel: 'Constant', 
      },
    });
  }, [lineColor]);

  const safeStart = startNode || (path && path[0]);
  const resolvedYOffset = parseFloat(yOffset ?? -1.2);

  // ── Dynamic Scale Logic: Switches based on the active Campus ───────────────
  const isDigital = path && path[0]?.nodeID?.includes("Digital");
  const CURRENT_H_SCALE = isDigital ? DIGITAL_HORIZONTAL_SCALE : MAIN_HORIZONTAL_SCALE;

  const points = useMemo(() => {
    if (!path || path.length < 2) return [];

    return path.map(node => {
      // 1. Calculate raw distance from origin
      const rawX = parseFloat(node.posX || 0) - parseFloat(safeStart?.posX || 0);
      const rawZ = parseFloat(node.posZ || 0) - parseFloat(safeStart?.posZ || 0);
      const rawY = parseFloat(node.posY || 0) - parseFloat(safeStart?.posY || 0);

      // 2. Apply Horizontal Scale (18-step vs 16-step)
      const x = rawX * -CURRENT_H_SCALE; 
      const z = rawZ * CURRENT_H_SCALE; 

      // 3. Apply Vertical Scale (Stairs Fix)
      const y = (rawY * VERTICAL_SCALE) + resolvedYOffset;

      return [x, y, z];
    });
  }, [path, safeStart, yOffset, CURRENT_H_SCALE]);

  // ── Stability Handler: Keeps the world locked even when out of sight ───────
  const _onTrackingUpdated = (state) => {
    setTrackingState(state);
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      console.log("[ARISE] World-Lock established.");
    }
  };

  return (
    <ViroARScene 
      onTrackingUpdated={_onTrackingUpdated}
      anchorDetectionTypes={['PlanesHorizontal']} // Helps lock the line to the floor
    >
      <ViroAmbientLight color="#ffffff" />

      {/* 
          Only render when tracking is stable (NORMAL). 
          This stops the line from jumping or re-snapping to the camera center. 
      */}
      {points.length > 1 && trackingState === ViroTrackingStateConstants.TRACKING_NORMAL && (
        <ViroPolyline
          position={[0, 0, 0]} 
          points={points}
          thickness={0.3}
          materials={['universityRed']}
        />
      )}
    </ViroARScene>
  );
};