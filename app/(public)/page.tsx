// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react";

export default function Home() {
  return (
    <div className="center-content">
      <div className="page-content">
        <h1>
          P<Clock8 className="logo" strokeWidth={2.75} />
          cket Heist
        </h1>
        <div>Plan the job. Run the crew. Take what&apos;s yours.</div>
        <div className="mt-6 space-y-2 text-sm text-gray-400 max-w-m text-center">
          <p>
            Welcome to Pocket Heist — your hub for sneaky office adventures.
          </p>
          <p>
            Plan your next mission, assign tasks to your crew, and keep tabs on
            every heist in progress.
          </p>
          <p>Ready to cause some chaos? Let&apos;s get started.</p>
        </div>
      </div>
    </div>
  );
}
