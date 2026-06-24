'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import FullscreenWrapper from '../../../components/FullscreenWrapper';
import type { GuitarWorkbenchSection, GuitarWorkbenchLocation } from './GuitarWorkbench';
import type { TriadsViewMode } from './MajorTriads';
import type { BoxScaleFamily } from '../lib/box-shapes';

// The workbench uses browser-only APIs (audio, wake lock), so load it client-side.
const GuitarWorkbench = dynamic(() => import('./GuitarWorkbench'), { ssr: false });

interface GuitarAppRouteProps {
  section: GuitarWorkbenchSection;
  triadsView: TriadsViewMode;
  boxFamily: BoxScaleFamily;
}

const BASE_PATH = '/projects/guitar';

/**
 * Map a workbench location to its canonical URL.
 *   triads -> /projects/guitar/triads/bykey | .../byvoicing
 *   boxes  -> /projects/guitar/boxes/pentatonic | .../major
 */
export function hrefForLocation(loc: GuitarWorkbenchLocation): string {
  if (loc.section === 'triads') {
    return `${BASE_PATH}/triads/${loc.triadsView === 'by-key' ? 'bykey' : 'byvoicing'}`;
  }
  return `${BASE_PATH}/boxes/${loc.boxFamily === 'major' ? 'major' : 'pentatonic'}`;
}

/**
 * Renders the guitar workbench for a given route and keeps the URL in sync with
 * in-app navigation (tab + sub-view changes). Sub-view changes within a section
 * use a shallow replace; switching sections navigates to the other route.
 */
export default function GuitarAppRoute({ section, triadsView, boxFamily }: GuitarAppRouteProps) {
  const router = useRouter();

  const handleNavigate = useCallback(
    (loc: GuitarWorkbenchLocation) => {
      const href = hrefForLocation(loc);
      if (href === router.asPath) {
        return;
      }
      // Shallow replace is only valid when we stay on the same dynamic page file
      // (so the [view]/[family] param just changes). From any other page, navigate.
      const onSamePageFile =
        (loc.section === 'triads' && router.pathname === `${BASE_PATH}/triads/[view]`) ||
        (loc.section === 'boxes' && router.pathname === `${BASE_PATH}/boxes/[family]`);
      if (onSamePageFile) {
        void router.replace(href, undefined, { shallow: true });
      } else {
        void router.push(href);
      }
    },
    [router]
  );

  // Match the original /projects/guitar layout: contained section + fullscreen wrapper.
  return (
    <div className="container-custom section">
      <FullscreenWrapper className="bg-slate-950 min-h-screen">
        <GuitarWorkbench
          initialSection={section}
          triadsView={triadsView}
          boxFamily={boxFamily}
          onNavigate={handleNavigate}
        />
      </FullscreenWrapper>
    </div>
  );
}
