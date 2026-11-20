/** @jest-environment node */
import { sendEmail } from "@/lib/email-client/infobip";

const ENV = {
  INFOBIP_BASE_URL: "abc123.api.infobip.com/",
  INFOBIP_API_KEY: "test-key",
  INFOBIP_FROM_EMAIL: "sender@example.com",
  INFOBIP_FROM_NAME: "Rick and Morty Finder",
};

const email = {
  to: "user@example.com",
  subject: "Hello",
  html: "<p>Hi</p>",
  text: "Hi",
};

describe("sendEmail", () => {
  const originalEnv = process.env;
  const fetchMock = jest.fn();

  beforeEach(() => {
    process.env = { ...originalEnv, ...ENV };
    fetchMock.mockReset();
    global.fetch = fetchMock;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("posts multipart form to Infobip Email API", async () => {
    fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));

    await sendEmail(email);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://abc123.api.infobip.com/email/3/send");
    expect(init.method).toBe("POST");
    expect(init.headers.Authorization).toBe("App test-key");
    const body = init.body as FormData;
    expect(body.get("from")).toBe("Rick and Morty Finder <sender@example.com>");
    expect(body.get("to")).toBe("user@example.com");
    expect(body.get("subject")).toBe("Hello");
    expect(body.get("html")).toBe("<p>Hi</p>");
    expect(body.get("text")).toBe("Hi");
  });

  it("throws when Infobip returns an error", async () => {
    fetchMock.mockResolvedValue(new Response("bad", { status: 401 }));

    await expect(sendEmail(email)).rejects.toThrow(
      "Infobip email send failed (401): bad",
    );
  });

  it("throws when configuration is missing", async () => {
    delete process.env.INFOBIP_API_KEY;

    await expect(sendEmail(email)).rejects.toThrow(
      "Missing environment variable INFOBIP_API_KEY",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
