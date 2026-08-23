import {
  transformGameweekPerformance,
  FPLGameweekPlayer,
} from "./gameweekPerformance";

async function runTest() {
  console.log("");
  console.log(
    "🍺 PRE-BEER GAMEWEEK PERFORMANCE TRANSFORMATION TEST"
  );
  console.log(
    "===================================================="
  );
  console.log("");

  /*
   * -------------------------------------------------------
   * TEST DATA
   * -------------------------------------------------------
   *
   * This mirrors the structure returned by
   * FPL /event/{GW}/live/.
   *
   * We deliberately use fake IDs.
   */

  const testPlayers: FPLGameweekPlayer[] = [
    {
      id: 101,
      explain: [
        {
          fixture: 5001,
          stats: [
            {
              identifier: "goals_scored",
              points: 10,
              value: 2,
            },
            {
              identifier: "assists",
              points: 3,
              value: 1,
            },
            {
              identifier: "clean_sheets",
              points: 1,
              value: 1,
            },
          ],
        },
      ],
    },

    {
      id: 102,
      explain: [
        {
          fixture: 5001,
          stats: [
            {
              identifier: "goals_scored",
              points: 5,
              value: 1,
            },
            {
              identifier: "clean_sheets",
              points: 1,
              value: 1,
            },
          ],
        },
      ],
    },

    {
      id: 103,
      explain: [
        {
          fixture: 5002,
          stats: [
            {
              identifier: "assists",
              points: 6,
              value: 2,
            },
          ],
        },
      ],
    },
  ];

  /*
   * FPL player ID → Pre-Beer club ID
   */
  const playerClubMap = new Map<number, number>([
    [101, 7],
    [102, 7],
    [103, 12],
  ]);

  const result = transformGameweekPerformance(
    testPlayers,
    playerClubMap
  );

  console.log("GOALS");
  console.log("-----");
  console.log(JSON.stringify(result.goals, null, 2));
  console.log("");

  console.log("ASSISTS");
  console.log("-------");
  console.log(JSON.stringify(result.assists, null, 2));
  console.log("");

  console.log("CLEAN SHEETS");
  console.log("------------");
  console.log(JSON.stringify(result.cleanSheets, null, 2));
  console.log("");

  /*
   * -------------------------------------------------------
   * ASSERTIONS
   * -------------------------------------------------------
   */

  if (result.goals.length !== 3) {
    throw new Error(
      `Expected 3 goal rows, got ${result.goals.length}`
    );
  }

  if (result.assists.length !== 3) {
    throw new Error(
      `Expected 3 assist rows, got ${result.assists.length}`
    );
  }

  /*
   * Players 101 and 102 are both Club 7
   * and both recorded a clean sheet in Fixture 5001.
   *
   * Only ONE clean-sheet row should exist.
   */
  if (result.cleanSheets.length !== 1) {
    throw new Error(
      `Expected 1 clean-sheet row, got ${result.cleanSheets.length}`
    );
  }

  if (
    result.cleanSheets[0].fixture_id !== 5001 ||
    result.cleanSheets[0].club_id !== 7
  ) {
    throw new Error(
      "Clean-sheet row contains incorrect fixture or club."
    );
  }

  console.log(
    "============================================"
  );
  console.log(
    "✅ ALL TRANSFORMATION TESTS PASSED!"
  );
  console.log(
    "============================================"
  );
  console.log("");
}

runTest().catch((error) => {
  console.error("");
  console.error(
    "❌ GAMEWEEK PERFORMANCE TEST FAILED"
  );
  console.error(error);
  process.exit(1);
});