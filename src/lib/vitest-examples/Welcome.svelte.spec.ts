import { page } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Welcome from './Welcome.svelte';

// NOTE: UI テスト実装の参考例として意図的に残している。
// 実アプリ側の UI テストが増えて不要になったら、このディレクトリごと削除を再検討する。
// 現在は vite.config.ts でテスト対象から除外している。
describe('Welcome.svelte', () => {
	it('renders greetings for host and guest', async () => {
		render(Welcome, { host: 'SvelteKit', guest: 'Vitest' });

		await expect
			.element(page.getByRole('heading', { level: 1 }))
			.toHaveTextContent('Hello, SvelteKit!');
		await expect.element(page.getByText('Hello, Vitest!')).toBeInTheDocument();
	});
});
