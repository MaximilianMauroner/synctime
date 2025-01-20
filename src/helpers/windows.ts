import { db } from '@/lib/db/db_client';
import { applications, applicationTimeRanges, titles, titleTimeRanges } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { exec } from 'node:child_process'

type WindowInfo = {
  application: string;
  title: string;
}

interface TimeRange {
  startTime: number;
  endTime: number;
}

interface ApplicationActivity {
  timeRanges: TimeRange[];
  titles: Map<string, TimeRange[]>;
}

type ApplicationMap = Map<string, ApplicationActivity>;

const applicationMap: ApplicationMap = new Map();
let currentActiveHash: string | null = null;

const getWindowHash = (data: WindowInfo): string => {
  return `${data.application}|${data.title}`;
}

const handleWindowData = (data: WindowInfo): void => {
  const now = Date.now();
  const newHash = getWindowHash(data);

  // If this is a different window than last time
  if (newHash !== currentActiveHash) {
    // Get or create application activity
    if (!applicationMap.has(data.application)) {
      applicationMap.set(data.application, {
        timeRanges: [],
        titles: new Map()
      });
    }
    const appActivity = applicationMap.get(data.application)!;

    // Start new application time range if needed
    if (appActivity.timeRanges.length === 0 ||
      currentActiveHash?.split('|')[0] !== data.application) {
      appActivity.timeRanges.push({
        startTime: now,
        endTime: now + 1000  // Set end time 1 second after start time
      });
    }

    // Handle title tracking
    if (!appActivity.titles.has(data.title)) {
      appActivity.titles.set(data.title, []);
    }
    appActivity.titles.get(data.title)!.push({
      startTime: now,
      endTime: now + 1000  // Set end time 1 second after start time
    });
  } else {
    // Update existing time ranges
    const appActivity = applicationMap.get(data.application);
    if (appActivity) {
      // Update application time range
      if (appActivity.timeRanges.length > 0) {
        appActivity.timeRanges[appActivity.timeRanges.length - 1].endTime = now;
      }

      // Update title time range
      const titleRanges = appActivity.titles.get(data.title);
      if (titleRanges && titleRanges.length > 0) {
        titleRanges[titleRanges.length - 1].endTime = now;
      }
    }
  }

  currentActiveHash = newHash;
}

const saveAndClearData = async () => {

  for (const [appName, appActivity] of applicationMap) {

    // Insert or get application
    const [existingApp] = await db
      .select()
      .from(applications)
      .where(eq(applications.name, appName));

    const appId = existingApp?.id || nanoid();

    if (!existingApp) {
      console.log(`Creating new application record for ${appName}`);
      await db.insert(applications).values({
        id: appId,
        name: appName,
      });
    }

    // Save application time ranges
    console.log(`Saving ${appActivity.timeRanges.length} time ranges for ${appName}`);
    for (const timeRange of appActivity.timeRanges) {
      await db.insert(applicationTimeRanges).values({
        id: nanoid(),
        applicationId: appId,
        startTime: timeRange.startTime,
        endTime: timeRange.endTime,
      });
    }

    // Save titles and their time ranges
    console.log(`Processing ${appActivity.titles.size} titles for ${appName}`);
    for (const [titleText, titleRanges] of appActivity.titles) {
      // Check if title exists
      const [existingTitle] = await db
        .select()
        .from(titles)
        .where(and(eq(titles.applicationId, appId), eq(titles.title, titleText)));

      let titleId = nanoid();
      if (existingTitle) {
        titleId = existingTitle.id;
        console.log(`Using existing title: ${titleText.substring(0, 50)}...`);
      } else {
        console.log(`Creating new title: ${titleText.substring(0, 50)}...`);
        await db.insert(titles).values({
          id: titleId,
          applicationId: appId,
          title: titleText,
        });
      }

      // Save title time ranges
      console.log(`Saving ${titleRanges.length} time ranges for title`);
      for (const timeRange of titleRanges) {
        await db.insert(titleTimeRanges).values({
          id: nanoid(),
          titleId: titleId,
          startTime: timeRange.startTime,
          endTime: timeRange.endTime,
        });
      }
    }
  }

  console.log('\nData save completed successfully');
  console.log('Clearing application map');
  applicationMap.clear();
}

let counter = 0;
let isProcessing = false;

export const getActiveWindow = async (): Promise<void> => {
  if (isProcessing) {
    return;
  }

  return new Promise((resolve) => {
    exec('powershell -File ./src/helpers/active_window.ps1', async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        resolve();
        return;
      }
      if (stderr) {
        console.error(`PowerShell Error: ${stderr}`);
        resolve();
        return;
      }

      try {
        if (!stdout) {
          resolve();
          return;
        }
        const windowData = JSON.parse(stdout);
        isProcessing = true;
        handleWindowData(windowData);
        isProcessing = false;

        if (counter >= 60 && !isProcessing) {
          isProcessing = true;
          console.log("saving")
          await saveAndClearData();
          counter = 0;
          isProcessing = false;
        }
        counter++;
        resolve();
      } catch (e) {
        const error = e instanceof Error ? e.message : 'Unknown error';
        console.error(`Error parsing window data: ${error}`);
        resolve();
        return;
      }
    });
  });
}

export const activeWindowChecker = (): void => {
  setInterval(async () => {
    await getActiveWindow();
  }, 1000);
}


