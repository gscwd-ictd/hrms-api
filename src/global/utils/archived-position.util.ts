/**
 * Archived plantilla position: the position a separated employee held, kept as their employment record.
 * It is marked with "*" in the item number and position title (e.g. "OPE-PAM-001*" / "Department Manager A*")
 * and a new position with the same item number replaces it. Archived positions are not listed in the plantilla,
 * position request (PRF) and duties / responsibilities / competencies (DRC) lists.
 */
export const isArchivedPosition = (position: { itemNumber?: unknown; positionTitle?: unknown }): boolean =>
  !!position && (String(position.itemNumber ?? '').includes('*') || String(position.positionTitle ?? '').includes('*'));

/** SQL condition (plantilla_positions alias) that leaves out archived positions */
export const notArchivedPositionSql = (alias = 'pp') =>
  `(IFNULL(${alias}.item_number, '') NOT LIKE '%*%' AND ${alias}.position_title NOT LIKE '%*%')`;
