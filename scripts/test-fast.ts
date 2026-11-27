/**
 * Run the test suite faster than `bun run test`, with the same tests and the same timeout.
 *
 * Integration tests start the CLI hundreds of times. Starting the bundled CLI skips transpiling
 * the TypeScript sources on every start, which is what CI does through BACKLOG_TEST_CLI_BUNDLE.
 * `--parallel` then spreads test files over one worker process per CPU core.
 *
 * Usage: bun run test:fast [--skip-build] [more `bun test` arguments, such as test files or --parallel=N]
 *
 * The bundle is built from the current sources on every run, so tests never start a stale CLI.
 * `--skip-build` reuses the bundle from the previous run when one exists, and builds it otherwise.
 * Use it only when the sources have not changed since that run. It is not passed to `bun test`.
 */
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const bundleDirectory = join(tmpdir(), "backlog-test-cli");
const bundlePath = join(bundleDirectory, "cli.js");
const bun = process.execPath;

const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const extraArgs = args.filter((arg) => arg !== "--skip-build");

if (skipBuild && existsSync(bundlePath)) {
	console.log(`Reusing the CLI bundle at ${bundlePath}.`);
} else {
	const build = Bun.spawnSync([bun, "scripts/build.ts"], {
		env: { ...process.env, BACKLOG_BUILD_OUTDIR: bundleDirectory },
		stdout: "inherit",
		stderr: "inherit",
	});
	if (build.exitCode !== 0) {
		console.error("Building the CLI bundle failed. Run `bun run test` to test against the sources instead.");
		process.exit(build.exitCode || 1);
	}
}

// A --parallel given on the command line, such as --parallel=2, replaces the default of one worker per core.
const parallelArgs = extraArgs.some((arg) => arg.startsWith("--parallel")) ? [] : ["--parallel"];

const tests = Bun.spawnSync([bun, "test", "--timeout=10000", ...parallelArgs, ...extraArgs], {
	env: { ...process.env, BACKLOG_TEST_CLI_BUNDLE: bundlePath },
	stdin: "inherit",
	stdout: "inherit",
	stderr: "inherit",
});
process.exit(tests.exitCode ?? 1);
