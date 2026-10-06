"use client";

import {
  useEffect,
  useState,
} from "react";

type Status =
  | {
      state: "checking";
    }
  | {
      state: "online";
      release: string | null;
    }
  | {
      state: "offline";
      message: string;
    };

export function EngineStatus() {
  const [status, setStatus] =
    useState<Status>({
      state: "checking",
    });

  useEffect(() => {
    let active = true;

    async function check() {
      try {
        const response =
          await fetch(
            "/api/engine-health",
            {
              cache: "no-store",
            },
          );
        const body =
          await response.json();

        if (!active) return;

        if (
          response.ok &&
          body.engine?.status ===
            "ok"
        ) {
          setStatus({
            state: "online",
            release:
              body.engine.release ??
              null,
          });
          return;
        }

        setStatus({
          state: "offline",
          message:
            body.message ??
            "Engine is unavailable",
        });
      } catch {
        if (active) {
          setStatus({
            state: "offline",
            message:
              "Engine is unavailable",
          });
        }
      }
    }

    void check();

    return () => {
      active = false;
    };
  }, []);

  let message =
    "Checking the configured upstream engine…";

  if (status.state === "online") {
    message =
      "Connected" +
      (status.release
        ? " · " + status.release
        : "");
  } else if (
    status.state === "offline"
  ) {
    message = status.message;
  }

  return (
    <section
      className="status"
      aria-live="polite"
    >
      <span
        className={
          status.state ===
          "online"
            ? "dot online"
            : status.state ===
                "offline"
              ? "dot offline"
              : "dot"
        }
      />
      <div>
        <strong>
          Engine connection
        </strong>
        <p>{message}</p>
      </div>
    </section>
  );
}
