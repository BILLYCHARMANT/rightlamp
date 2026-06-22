/** Default before layout is measured on the client. */
export const DEFAULT_PAGE_SIZE = 6;

const TABLE_HEAD_HEIGHT = 44;
const PAGINATION_FOOTER_HEIGHT = 56;
const VIEWPORT_BOTTOM_GAP = 20;

/**
 * How many table rows fit in the viewport below `anchorTop`, adjusted for screen width.
 */
export function computePageSizeFromLayout(
  anchorTop: number,
  viewportHeight: number,
  viewportWidth: number,
): number {
  const rowHeight = viewportWidth < 640 ? 60 : 54;
  const available =
    viewportHeight - anchorTop - PAGINATION_FOOTER_HEIGHT - VIEWPORT_BOTTOM_GAP;
  const rowsThatFit = Math.floor((available - TABLE_HEAD_HEIGHT) / rowHeight);

  let maxForWidth = 20;
  if (viewportWidth < 640) maxForWidth = 5;
  else if (viewportWidth < 768) maxForWidth = 7;
  else if (viewportWidth < 1024) maxForWidth = 9;
  else if (viewportWidth < 1280) maxForWidth = 11;
  else if (viewportWidth < 1536) maxForWidth = 14;

  const minForWidth = viewportWidth < 640 ? 3 : 4;

  return Math.min(
    maxForWidth,
    Math.max(minForWidth, rowsThatFit),
  );
}
