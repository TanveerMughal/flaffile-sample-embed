import { FlatfileListener } from "@flatfile/listener";
import api, { Flatfile } from "@flatfile/api";
import { getData } from "./App";

async function submit(jobId: string, workbookId: string) {
  try {
    await api.jobs.ack(jobId, {
      info: "I'm starting the job - inside client",
      progress: 33,
    });

    const { data: sheets } = await api.sheets.list({ workbookId });

    // console.log({ sheets });

    const records: { [name: string]: any } = {};
    for (const [index, element] of sheets.entries()) {
      records[`Sheet[${index}]`] = await api.records.get(element.id);
    }

    const record = records["Sheet[0]"].data.records.map((record: any) => {
      const fullName = `${record.values["first_name"].value} ${record.values["last_name"].value}`;
      return fullName;
    });

    console.log({ record });

    getData(record);

    // console.log(JSON.stringify(records, null, 2));

    await api.jobs.complete(jobId, {
      info: "Job Completed",
    });
  } catch (e) {
    await api.jobs.fail(jobId, {
      outcome: { message: `Error: ${e}` },
    });
  }
}

async function joinFields(jobId: string, sheetId: string) {
  try {
    await api.jobs.ack(jobId, {
      info: "I'm starting the joining fields job",
    });
  } catch (e) {
    throw new Error(`Error acknowledging jobId: ${jobId} ${e}`);
  }

  try {
    const records = await api.records.get(sheetId);
    const recordsUpdates = records.data.records?.map((record) => {
      const fullName = `${record.values["first_name"].value} ${record.values["last_name"].value}`;
      record.values["full_name"].value = fullName;
      return record;
    });

    await api.records.update(sheetId, recordsUpdates as Flatfile.Record_[]);
  } catch (e) {
    throw new Error(`Error updating records`);
  }

  try {
    await api.jobs.complete(jobId, {
      info: "Job's work is done",
    });
  } catch (e) {
    throw new Error(`Error completing job: ${jobId}`);
  }
}

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.on("**", (event) => {
    console.log(`Received event: ${event.topic}`);
  });

  client.on(
    "job:ready",
    // @ts-ignore
    { payload: { operation: "contacts:join-fields" } },
    async (event: any) => {
      const { context } = event;
      return joinFields(context.jobId, context.sheetId);
    }
  );

  client.on(
    "job:ready",
    // @ts-ignore
    { payload: { operation: "contacts:submit" } },
    async (event: any) => {
      const { context } = event;
      const jobId = context.jobId;
      const workbookId = context.workbookId;

      // const file = await api.files.get(context.fileId);

      return submit(jobId, workbookId);
    }
  );
});
