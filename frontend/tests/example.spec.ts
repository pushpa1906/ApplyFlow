import { test, expect, type Page } from "@playwright/test";

async function openDemo(page: Page) {
  await page.goto("/");

  await page
    .getByRole("button", {
      name: "Open Demo",
      exact: true,
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Dashboard",
      exact: true,
    }),
  ).toBeVisible();
}

test.describe("ApplyFlow Demo", () => {
  //------------------------------1-------------------------
  test("user can open demo mode and view the dashboard", async ({ page }) => {
    // Open ApplyFlow
    await page.goto("/");

    // Verify the welcome page loaded
    await expect(
      page.getByText("ApplyFlow", { exact: true }).first(),
    ).toBeVisible();

    // Find and click the Demo button
    await page.getByRole("button", { name: /demo/i }).click();

    // Verify that we entered the application
    await expect(
      page.getByRole("heading", { name: "Dashboard" }),
    ).toBeVisible();

    // Verify important navigation is available
    await expect(
      page.getByText("Applications", { exact: true }).first(),
    ).toBeVisible();

    await expect(
      page.getByText("Goals", { exact: true }).first(),
    ).toBeVisible();

    await expect(
      page.getByText("Settings", { exact: true }).first(),
    ).toBeVisible();
  });
  //------------------------------2-------------------------
  test("user can navigate through the main pages", async ({ page }) => {
    await openDemo(page);

    // Dashboard
    await expect(
      page.getByRole("heading", {
        name: "Dashboard",
        exact: true,
      }),
    ).toBeVisible();

    // Applications
    await page.getByText("Applications", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    // Goals
    await page.getByText("Goals", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Goals",
        exact: true,
      }),
    ).toBeVisible();

    // Settings
    await page.getByText("Settings", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Settings",
        exact: true,
      }),
    ).toBeVisible();

    // Back to Dashboard
    await page.getByText("Dashboard", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Dashboard",
        exact: true,
      }),
    ).toBeVisible();
  });

  //------------------------------3-------------------------
  test("user can create a new application", async ({ page }) => {
    await openDemo(page);

    // Navigate to Applications
    await page.getByText("Applications", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    // Open New Application form
    await page.getByRole("button", { name: /new application/i }).click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).toBeVisible();

    // Fill Company
    await page.getByLabel(/Company/).fill("Playwright Test Company");

    // Fill Role
    await page.getByLabel(/Role/).fill("Frontend Developer");

    // Fill Applied Date
    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    // Save the application
    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    // Verify our new application appears
    await expect(
      page.getByText("Playwright Test Company", {
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByText("Frontend Developer", {
        exact: true,
      }),
    ).toBeVisible();
  });

  //------------------------------4-------------------------
  test("user can edit an existing application", async ({ page }) => {
    await openDemo(page);

    // Go to Applications
    await page.getByText("Applications", { exact: true }).first().click();

    /*
     * STEP 1
     * Create an application that we can edit.
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Edit Company");

    await page.getByLabel(/Role/).fill("Frontend Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    // Make sure creation worked
    await expect(
      page.getByText("Playwright Edit Company", {
        exact: true,
      }),
    ).toBeVisible();

    /*
     * STEP 2
     * Find that application's row.
     */
    const applicationRow = page.getByRole("row").filter({
      hasText: "Playwright Edit Company",
    });

    await expect(applicationRow).toBeVisible();

    /*
     * STEP 3
     * Click Edit inside THIS row.
     */
    await applicationRow
      .getByRole("button", {
        name: "Edit",
      })
      .click();

    // Verify Edit modal opened
    await expect(
      page.getByRole("heading", {
        name: "Edit application",
        exact: true,
      }),
    ).toBeVisible();

    /*
     * STEP 4
     * Change the Role.
     */
    const roleInput = page.getByLabel(/Role/);

    await roleInput.fill("Senior Frontend Developer");

    /*
     * STEP 5
     * Change Application Status.
     */
    const editStatusField = page.locator("label").filter({
      hasText: "Application Status",
    });

    await editStatusField.getByRole("button").first().click();

    await editStatusField
      .getByRole("button", {
        name: "Technical Interview",
        exact: true,
      })
      .click();

    /*
     * STEP 6
     * Save the changes.
     */
    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Edit application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * STEP 7
     * Verify the updated values.
     */
    const updatedRow = page.getByRole("row").filter({
      hasText: "Playwright Edit Company",
    });

    await expect(
      updatedRow.getByText("Senior Frontend Developer", { exact: true }),
    ).toBeVisible();

    await expect(
      updatedRow.getByText("Technical Interview", { exact: true }),
    ).toBeVisible();
  });

  //------------------------------5-------------------------
  test("user can delete an application", async ({ page }) => {
    await openDemo(page);

    // Wait until Demo mode has actually loaded
    await expect(
      page.getByRole("heading", {
        name: "Dashboard",
        exact: true,
      }),
    ).toBeVisible();

    // Go to Applications
    await page.getByText("Applications", { exact: true }).first().click();

    /*
     * STEP 1
     * Create an application specifically for this test.
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Delete Company");

    await page.getByLabel(/Role/).fill("Web Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    // Save
    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    // Confirm that saving completed
    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * STEP 2
     * Verify that the application exists.
     */
    const applicationRow = page.getByRole("row").filter({
      hasText: "Playwright Delete Company",
    });

    await expect(applicationRow).toBeVisible();

    /*
     * STEP 3
     * Prepare Playwright for window.confirm().
     *
     * ApplyFlow asks:
     * "Delete this application?"
     *
     * Playwright will automatically click OK.
     */
    page.once("dialog", async (dialog) => {
      expect(dialog.type()).toBe("confirm");

      expect(dialog.message()).toBe("Delete this application?");

      await dialog.accept();
    });

    /*
     * STEP 4
     * Click Delete on this specific row.
     */
    await applicationRow
      .getByRole("button", {
        name: "Delete",
      })
      .click();

    /*
     * STEP 5
     * Verify that the application disappeared.
     */
    await expect(
      page.getByText("Playwright Delete Company", { exact: true }),
    ).not.toBeVisible();
  });

  //------------------------------6-------------------------
  test("user can search applications", async ({ page }) => {
    await openDemo(page);

    // Go to Applications
    await page.getByText("Applications", { exact: true }).first().click();

    /*
     * STEP 1
     * Create the first application.
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Alpha Company");

    await page.getByLabel(/Role/).fill("Frontend Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();
    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * STEP 2
     * Create a second application.
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Beta Company");

    await page.getByLabel(/Role/).fill("Software Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * STEP 3
     * Verify both applications exist before searching.
     */
    await expect(
      page.getByText("Playwright Alpha Company", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Playwright Beta Company", { exact: true }),
    ).toBeVisible();

    /*
     * STEP 4
     * Find the search box and search for Alpha.
     */
    const searchInput = page.getByPlaceholder(/search/i);

    await searchInput.fill("Playwright Alpha");

    /*
     * STEP 5
     * Alpha should remain.
     */
    await expect(
      page.getByText("Playwright Alpha Company", { exact: true }),
    ).toBeVisible();

    /*
     * Beta should be filtered out.
     */
    await expect(
      page.getByText("Playwright Beta Company", { exact: true }),
    ).not.toBeVisible();

    /*
     * STEP 6
     * Clear the search.
     */
    await searchInput.clear();

    /*
     * Both should appear again.
     */
    await expect(
      page.getByText("Playwright Alpha Company", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Playwright Beta Company", { exact: true }),
    ).toBeVisible();
  });

  //------------------------------7-------------------------
  test("user can filter applications by status", async ({ page }) => {
    await openDemo(page);

    // Go to Applications
    await page.getByText("Applications", { exact: true }).first().click();

    /*
     * CREATE APPLICATION 1
     * Status: Applied
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Applied Company");

    await page.getByLabel(/Role/).fill("Web Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    // Explicitly set the first application to Applied
    const appliedStatusField = page.locator("label").filter({
      hasText: "Application Status",
    });

    await appliedStatusField.getByRole("button").first().click();

    await appliedStatusField
      .getByRole("button", {
        name: "Applied",
        exact: true,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * CREATE APPLICATION 2
     * Status: Rejected
     */
    await page.getByRole("button", { name: /new application/i }).click();

    await page.getByLabel(/Company/).fill("Playwright Rejected Company");

    await page.getByLabel(/Role/).fill("Software Developer");

    await page.getByLabel(/Applied Date/).fill("2026-08-08");

    const statusField = page.locator("label").filter({
      hasText: "Application Status",
    });

    await statusField.getByRole("button").first().click();

    await statusField
      .getByRole("button", {
        name: "Rejected",
        exact: true,
      })
      .click();

    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
     * Verify both exist before filtering.
     */
    await expect(
      page.getByText("Playwright Applied Company", { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByText("Playwright Rejected Company", { exact: true }),
    ).toBeVisible();

    /*
     * Open Filters.
     */
    await page.getByRole("button", { name: /filter/i }).click();

    /*
     * Select Application Status as filter type.
     */
    await page.getByLabel("Type").selectOption("Application Status");

    /*
     * Select Applied.
     */
    await page.getByLabel("Value").selectOption("Applied");

    /*
     * Apply filter.
     */
    await page
      .getByRole("button", {
        name: "Apply",
        exact: true,
      })
      .click();

    /*
     * Applied company should remain.
     */
    await expect(
      page.getByText("Playwright Applied Company", { exact: true }),
    ).toBeVisible();

    /*
     * Rejected company should disappear.
     */
    await expect(
      page.getByText("Playwright Rejected Company", { exact: true }),
    ).not.toBeVisible();
  });

  //------------------------------8-------------------------
  test("new application automatically gets last updated and follow up dates", async ({
    page,
  }) => {
    await openDemo(page);

    // Go to Applications
    await page
      .getByText("Applications", {
        exact: true,
      })
      .first()
      .click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    /*
    * STEP 1
    * Open the New Application form.
    */
    await page
      .getByRole("button", {
        name: /new application/i,
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).toBeVisible();

    /*
    * STEP 2
    * Fill application details.
    */
    await page
      .getByLabel(/Company/)
      .fill("Playwright Follow Up Company");

    await page
      .getByLabel(/Role/)
      .fill("Frontend Developer");

    // Fixed input is intentional.
    // We verify that Applied Date remains unchanged.
    await page
      .getByLabel(/Applied Date/)
      .fill("2026-08-08");

    /*
    * STEP 3
    * Set status to Applied.
    *
    * Applied is an active status and should
    * receive an automatic follow-up.
    */
    const statusField = page.locator("label").filter({
      hasText: "Application Status",
    });

    await statusField
      .getByRole("button")
      .first()
      .click();

    await statusField
      .getByRole("button", {
        name: "Applied",
        exact: true,
      })
      .click();

    /*
    * STEP 4
    * Calculate the expected Follow Up Date.
    *
    * Follow Up Date = today + 7 days.
    */
    const expectedFollowUp = new Date();

    expectedFollowUp.setHours(0, 0, 0, 0);

    expectedFollowUp.setDate(
      expectedFollowUp.getDate() + 7,
    );

    const expectedFollowUpDate = [
      String(
        expectedFollowUp.getMonth() + 1,
      ).padStart(2, "0"),

      String(
        expectedFollowUp.getDate(),
      ).padStart(2, "0"),

      expectedFollowUp.getFullYear(),
    ].join("/");

    /*
    * STEP 5
    * Save the application.
    */
    await page
      .getByRole("button", {
        name: "Save application",
      })
      .click();

    await expect(
      page.getByRole("heading", {
        name: "New application",
        exact: true,
      }),
    ).not.toBeVisible();

    /*
    * STEP 6
    * Find the newly created application.
    */
    const applicationRow = page
      .getByRole("row")
      .filter({
        hasText: "Playwright Follow Up Company",
      });

    await expect(applicationRow).toBeVisible();

    /*
    * Applied Date should remain exactly
    * what the user entered.
    */
    await expect(applicationRow).toContainText(
      "2026-08-08",
    );

    /*
    * Follow Up Date should automatically
    * be today + 7 days.
    */
    await expect(applicationRow).toContainText(
      expectedFollowUpDate,
    );
  });
  //------------------------------9-------------------------
  test("dashboard follow-up cards open the correct application filters", async ({
    page,
  }) => {
    await openDemo(page);

    /*
     * DASHBOARD
     *
     * Verify the three follow-up categories are visible.
     */
    const todayFollowUp = page.getByText("Today", { exact: true }).first();

    const upcomingFollowUp = page
      .getByText("Upcoming", { exact: true })
      .first();

    const overdueFollowUp = page.getByText("Overdue", { exact: true }).first();

    await expect(todayFollowUp).toBeVisible();
    await expect(upcomingFollowUp).toBeVisible();
    await expect(overdueFollowUp).toBeVisible();

    /*
     * TEST TODAY
     */
    await todayFollowUp.click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    // The active filter should be Follow Up: Today
    await expect(
      page.getByRole("button", {
        name: /Follow Up Date.*Today/i,
      }),
    ).toBeVisible();

    /*
     * Return to Dashboard.
     */
    await page.getByText("Dashboard", { exact: true }).first().click();

    /*
     * TEST UPCOMING
     */
    await page.getByText("Upcoming", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Follow Up Date.*Upcoming/i,
      }),
    ).toBeVisible();

    /*
     * Return to Dashboard.
     */
    await page.getByText("Dashboard", { exact: true }).first().click();

    /*
     * TEST OVERDUE
     */
    await page.getByText("Overdue", { exact: true }).first().click();

    await expect(
      page.getByRole("heading", {
        name: "Applications",
        exact: true,
      }),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Follow Up Date.*Overdue/i,
      }),
    ).toBeVisible();
  });

  //------------------------------10-------------------------
test("changing application status recalculates the follow up date", async ({
  page,
}) => {
  await openDemo(page);

  // Go to Applications
  await page
    .getByText("Applications", {
      exact: true,
    })
    .first()
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Applications",
      exact: true,
    }),
  ).toBeVisible();

  /*
   * STEP 1
   * Create a new application.
   */
  await page
    .getByRole("button", {
      name: /new application/i,
    })
    .click();

  await page
    .getByLabel(/Company/)
    .fill("Playwright Status Change Company");

  await page
    .getByLabel(/Role/)
    .fill("Frontend Developer");

  // Fixed Applied Date is intentional test input.
  await page
    .getByLabel(/Applied Date/)
    .fill("2026-08-08");

  /*
   * Set initial status to Applied.
   */
  const createStatusField = page.locator("label").filter({
    hasText: "Application Status",
  });

  await createStatusField
    .getByRole("button")
    .first()
    .click();

  await createStatusField
    .getByRole("button", {
      name: "Applied",
      exact: true,
    })
    .click();

  /*
   * Calculate expected automatic Follow Up Date.
   *
   * Follow Up Date = today + 7 days.
   */
  const expectedFollowUp = new Date();

  expectedFollowUp.setHours(0, 0, 0, 0);

  expectedFollowUp.setDate(
    expectedFollowUp.getDate() + 7,
  );

  const expectedFollowUpDate = [
    String(
      expectedFollowUp.getMonth() + 1,
    ).padStart(2, "0"),

    String(
      expectedFollowUp.getDate(),
    ).padStart(2, "0"),

    expectedFollowUp.getFullYear(),
  ].join("/");

  /*
   * Save new application.
   */
  await page
    .getByRole("button", {
      name: "Save application",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "New application",
      exact: true,
    }),
  ).not.toBeVisible();

  /*
   * STEP 2
   * Find the newly created application.
   */
  let applicationRow = page
    .getByRole("row")
    .filter({
      hasText: "Playwright Status Change Company",
    });

  await expect(applicationRow).toBeVisible();

  /*
   * Applied should automatically receive
   * a follow-up 7 days from today.
   */
  await expect(applicationRow).toContainText(
    expectedFollowUpDate,
  );

  /*
   * STEP 3
   * Edit the application.
   */
  await applicationRow
    .getByRole("button", {
      name: "Edit",
      exact: true,
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Edit application",
      exact: true,
    }),
  ).toBeVisible();

  /*
   * STEP 4
   * Change status:
   *
   * Applied → Rejected
   *
   * Rejected does not support follow-ups.
   */
  const editStatusField = page.locator("label").filter({
    hasText: "Application Status",
  });

  await editStatusField
    .getByRole("button")
    .first()
    .click();

  await editStatusField
    .getByRole("button", {
      name: "Rejected",
      exact: true,
    })
    .click();

  /*
   * Save the edited application.
   */
  await page
    .getByRole("button", {
      name: "Save application",
    })
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Edit application",
      exact: true,
    }),
  ).not.toBeVisible();

  /*
   * STEP 5
   * Find the row again after React updates.
   */
  applicationRow = page
    .getByRole("row")
    .filter({
      hasText: "Playwright Status Change Company",
    });

  await expect(applicationRow).toBeVisible();

  /*
   * Verify status changed.
   */
  await expect(
    applicationRow.getByText("Rejected", {
      exact: true,
    }),
  ).toBeVisible();

  /*
   * Rejected applications should no longer
   * have the previously generated
   * Follow Up Date.
   */
  await expect(
    applicationRow.getByRole("cell", {
      name: expectedFollowUpDate,
      exact: true,
    }),
  ).not.toBeVisible();

  /*
   * The Follow Up action should also
   * not be available for Rejected.
   */
  await expect(
    applicationRow.getByRole("button", {
      name: "Follow Up",
      exact: true,
    }),
  ).not.toBeVisible();
});

//------------------------------11-------------------------
test("user can complete a due follow up and schedule the next follow up", async ({
  page,
}) => {
  await openDemo(page);

  // Go to Applications
  await page
    .getByText("Applications", {
      exact: true,
    })
    .first()
    .click();

  await expect(
    page.getByRole("heading", {
      name: "Applications",
      exact: true,
    }),
  ).toBeVisible();

  /*
   * STEP 1
   * Find any application that is currently
   * due today and has the Follow Up action.
   */
  const dueRow = page
    .getByRole("row")
    .filter({
      has: page.getByRole("cell", {
        name: /🔔 Today/,
      }),
    })
    .filter({
      has: page.getByRole("button", {
        name: "Follow Up",
        exact: true,
      }),
    })
    .first();

  await expect(dueRow).toBeVisible();

  /*
   * STEP 2
   * Capture stable values BEFORE changing
   * the follow-up date.
   *
   * Cell 0 = Company
   * Cell 1 = Role
   */
  const cells = dueRow.getByRole("cell");

  const company = await cells
    .nth(0)
    .innerText();

  const role = await cells
    .nth(1)
    .innerText();

  /*
   * STEP 3
   * Build a stable row locator.
   *
   * We don't use "Today" as the permanent
   * locator because that text disappears
   * after completing the follow-up.
   */
  const applicationRow = page
    .getByRole("row")
    .filter({
      has: page.getByRole("cell", {
        name: company,
        exact: true,
      }),
    })
    .filter({
      has: page.getByRole("cell", {
        name: role,
        exact: true,
      }),
    })
    .first();

  await expect(applicationRow).toBeVisible();

  /*
   * STEP 4
   * Verify Follow Up is available.
   */
  const followUpButton =
    applicationRow.getByRole("button", {
      name: "Follow Up",
      exact: true,
    });

  await expect(
    followUpButton,
  ).toBeVisible();

  /*
   * STEP 5
   * Calculate the expected next Follow Up Date.
   *
   * Next Follow Up = today + 7 days.
   */
  const expectedFollowUp = new Date();

  expectedFollowUp.setHours(
    0,
    0,
    0,
    0,
  );

  expectedFollowUp.setDate(
    expectedFollowUp.getDate() + 7,
  );

  const expectedFollowUpDate = [
    String(
      expectedFollowUp.getMonth() + 1,
    ).padStart(2, "0"),

    String(
      expectedFollowUp.getDate(),
    ).padStart(2, "0"),

    expectedFollowUp.getFullYear(),
  ].join("/");

  /*
   * STEP 6
   * Complete the follow-up.
   */
  await followUpButton.click();

  /*
   * STEP 7
   * Verify the new Follow Up Date.
   */
  await expect(applicationRow).toContainText(
    expectedFollowUpDate,
  );

  /*
   * STEP 8
   * The application should no longer
   * be marked as due Today.
   */
  await expect(
    applicationRow.getByRole("cell", {
      name: /🔔 Today/,
    }),
  ).not.toBeVisible();

  /*
   * It should not be Overdue.
   */
  await expect(
    applicationRow.getByRole("cell", {
      name: /⚠ Overdue/,
    }),
  ).not.toBeVisible();

  /*
   * STEP 9
   * Follow Up should disappear until
   * the new date becomes due.
   */
  await expect(
    applicationRow.getByRole("button", {
      name: "Follow Up",
      exact: true,
    }),
  ).not.toBeVisible();
});
});