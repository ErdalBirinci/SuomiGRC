import { AutomatedTest, WebhookConfig, WebhookDeliveryLog } from '../types/grc';

/**
 * Builds realistic Slack Block Kit payload for test failure or resolution
 */
export function buildSlackPayload(
  test: AutomatedTest,
  isResolved = false
): Record<string, any> {
  if (isResolved) {
    return {
      text: `✅ *[RESOLVED] SuomiGRC Test Passed:* ${test.title}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `✅ [RESOLVED] ${test.title}`,
            emoji: true,
          },
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Status:* Automated Passing\n*Integration:* ${test.integrationName}\n*Category:* ${test.category}\n*Satisfied Controls:* ${test.satisfiedControls.join(', ') || 'N/A'}\n*All failing resources have been remediated.*`,
          },
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `Audited by SuomiGRC Continuous Engine · ${new Date().toLocaleTimeString()}`,
            },
          ],
        },
      ],
    };
  }

  const failingResourceSummary =
    test.failingResources.length > 0
      ? test.failingResources
          .map(
            (r, i) =>
              `• *${r.name}* (\`${r.arnOrPath}\`)\n  Owner: \`${r.owner}\`\n  Remediation: _${r.remediationSuggestion}_`
          )
          .join('\n')
      : 'Automated policy check returned non-zero error state.';

  return {
    text: `🚨 *[${test.severity.toUpperCase()}] SuomiGRC Automated Test Failure:* ${test.title}`,
    attachments: [
      {
        color:
          test.severity === 'critical'
            ? '#EF4444'
            : test.severity === 'high'
            ? '#F97316'
            : '#EAB308',
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `🚨 [${test.severity.toUpperCase()} ALERT] ${test.title}`,
              emoji: true,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Integration:* ${test.integrationName}\n*Severity:* \`${test.severity.toUpperCase()}\`\n*Description:* ${test.description}\n*Controls Impacted:* ${test.satisfiedControls.join(', ') || 'CC6.1'}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Non-Compliant Resources Detected (${test.failingResources.length}):*\n${failingResourceSummary}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Inspect in SuomiGRC',
                },
                style: 'danger',
                url: `https://app.suomigrc.io/controls?testId=${test.id}`,
              },
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'View Remediation Script',
                },
                url: `https://app.suomigrc.io/remediate/${test.id}`,
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Builds realistic Microsoft Teams Adaptive Card payload
 */
export function buildTeamsPayload(
  test: AutomatedTest,
  isResolved = false
): Record<string, any> {
  if (isResolved) {
    return {
      type: 'message',
      attachments: [
        {
          contentType: 'application/vnd.microsoft.card.adaptive',
          content: {
            $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
            version: '1.4',
            type: 'AdaptiveCard',
            msteams: { width: 'Full' },
            body: [
              {
                type: 'TextBlock',
                size: 'Large',
                weight: 'Bolder',
                color: 'Good',
                text: `✅ RESOLVED: ${test.title}`,
              },
              {
                type: 'TextBlock',
                text: `Automated test passed verification. All resources are compliant with ${test.satisfiedControls.join(', ')}.`,
                wrap: true,
              },
              {
                type: 'FactSet',
                facts: [
                  { title: 'Integration', value: test.integrationName },
                  { title: 'Status', value: '100% Passing' },
                  { title: 'Timestamp', value: new Date().toLocaleTimeString() },
                ],
              },
            ],
          },
        },
      ],
    };
  }

  const primaryResource = test.failingResources[0]?.arnOrPath || 'General configuration drift';

  return {
    type: 'message',
    attachments: [
      {
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: {
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.4',
          type: 'AdaptiveCard',
          msteams: { width: 'Full' },
          body: [
            {
              type: 'TextBlock',
              size: 'Large',
              weight: 'Bolder',
              color: 'Attention',
              text: `🚨 SuomiGRC: [${test.severity.toUpperCase()}] Test Failure`,
            },
            {
              type: 'TextBlock',
              text: test.description,
              wrap: true,
            },
            {
              type: 'FactSet',
              facts: [
                { title: 'Test ID', value: test.id },
                { title: 'Test Name', value: test.title },
                { title: 'Severity', value: test.severity.toUpperCase() },
                { title: 'Integration', value: test.integrationName },
                { title: 'Controls Violated', value: test.satisfiedControls.join(', ') || 'N/A' },
                { title: 'Affected Target', value: primaryResource },
              ],
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'View In SuomiGRC',
              url: `https://app.suomigrc.io/controls?testId=${test.id}`,
            },
            {
              type: 'Action.OpenUrl',
              title: 'Remediate Now',
              url: `https://app.suomigrc.io/remediate/${test.id}`,
            },
          ],
        },
      },
    ],
  };
}

/**
 * Builds generic JSON webhook payload
 */
export function buildGenericPayload(
  test: AutomatedTest,
  isResolved = false
): Record<string, any> {
  return {
    specversion: '1.0',
    type: isResolved ? 'io.suomigrc.test.resolved' : 'io.suomigrc.test.failed',
    source: 'https://api.suomigrc.io/scanner/v2',
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    time: new Date().toISOString(),
    datacontenttype: 'application/json',
    data: {
      testId: test.id,
      title: test.title,
      severity: test.severity,
      status: isResolved ? 'passing' : 'failing',
      integration: test.integrationName,
      impactedControls: test.satisfiedControls,
      failingResourcesCount: isResolved ? 0 : test.failingResources.length,
      failingResources: isResolved ? [] : test.failingResources,
    },
  };
}

/**
 * Dispatches test failure or resolution to all matching active webhooks.
 * Returns newly generated delivery log entries and updated webhook states.
 */
export function dispatchTestWebhook(
  test: AutomatedTest,
  isResolved: boolean,
  webhooks: WebhookConfig[]
): {
  logs: WebhookDeliveryLog[];
  updatedWebhooks: WebhookConfig[];
  notifiedChannels: string[];
} {
  const newLogs: WebhookDeliveryLog[] = [];
  const notifiedChannels: string[] = [];

  const updatedWebhooks = webhooks.map((wh) => {
    if (!wh.enabled) return wh;

    // Check trigger configuration
    if (!isResolved && !wh.triggers.testFailures) return wh;
    if (isResolved && !wh.triggers.testResolved) return wh;

    // Check severity filter if failing
    if (!isResolved) {
      if (wh.severityFilter === 'critical_only' && test.severity !== 'critical') {
        return wh;
      }
      if (wh.severityFilter === 'critical_high' && test.severity !== 'critical' && test.severity !== 'high') {
        return wh;
      }
    }

    let payload: Record<string, any>;
    if (wh.platform === 'slack') {
      payload = buildSlackPayload(test, isResolved);
    } else if (wh.platform === 'teams') {
      payload = buildTeamsPayload(test, isResolved);
    } else {
      payload = buildGenericPayload(test, isResolved);
    }

    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const latency = Math.floor(Math.random() * 95) + 85; // 85ms - 180ms

    const summary = isResolved
      ? `✅ RESOLVED: ${test.title} (Passed verification)`
      : `🚨 [${test.severity.toUpperCase()}] ${test.title} (${test.failingResources.length} non-compliant resources)`;

    const logEntry: WebhookDeliveryLog = {
      id: logId,
      webhookId: wh.id,
      webhookName: wh.name,
      platform: wh.platform,
      event: isResolved ? 'test.resolved' : 'test.failed',
      timestamp: 'Just now',
      status: 'success',
      statusCode: 200,
      latencyMs: latency,
      payloadSummary: summary,
      fullPayload: payload,
      testDetails: {
        testId: test.id,
        testTitle: test.title,
        severity: test.severity,
        integrationName: test.integrationName,
        failingCount: isResolved ? 0 : test.failingResources.length,
      },
    };

    newLogs.push(logEntry);
    notifiedChannels.push(`${wh.channel} (${wh.platform === 'slack' ? 'Slack' : wh.platform === 'teams' ? 'Teams' : 'HTTP'})`);

    return {
      ...wh,
      lastTriggeredAt: 'Just now',
      lastStatus: '200 OK' as const,
      successfulDeliveries: wh.successfulDeliveries + 1,
    };
  });

  return { logs: newLogs, updatedWebhooks, notifiedChannels };
}
