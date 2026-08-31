import React, { useState } from 'react';

import { ComplexCron, Schedule, SimpleCron, convertCronToText, cron2state, type IobTheme } from '../../../src';
import { I18n } from '../../../src/i18n';
import DemoCard, { DemoPage } from './DemoCard';

export default function CronDemo(props: { theme: IobTheme }): React.JSX.Element {
    const [simple, setSimple] = useState('0 * * * *');
    const [complex, setComplex] = useState('0 0 * * *');
    const [schedule, setSchedule] = useState('{"time":{"exactTime":true,"start":"07:30"},"period":{"days":1}}');

    return (
        <DemoPage>
            <DemoCard
                title="SimpleCron"
                hint="the wizard for the common cron cases"
                wide
                value={`${simple}  ->  ${convertCronToText(simple, I18n.getLanguage())}`}
            >
                <SimpleCron
                    cronExpression={simple}
                    language={I18n.getLanguage()}
                    onChange={setSimple}
                />
            </DemoCard>

            <DemoCard
                title="ComplexCron"
                hint="every cron field individually"
                wide
                value={`${complex}  ->  ${convertCronToText(complex, I18n.getLanguage())}`}
            >
                <ComplexCron
                    cronExpression={complex}
                    language={I18n.getLanguage()}
                    onChange={setComplex}
                />
            </DemoCard>

            <DemoCard
                title="Schedule"
                hint="the ioBroker schedule object (not a cron string)"
                wide
                value={schedule}
            >
                <Schedule
                    theme={props.theme}
                    schedule={schedule}
                    onChange={setSchedule}
                />
            </DemoCard>

            <DemoCard
                title="cron2state / convertCronToText"
                hint="the helper functions exported next to the components"
                wide
            >
                <pre style={{ fontSize: '0.78rem', margin: 0, whiteSpace: 'pre-wrap' }}>
                    {[
                        `cron2state('${simple}') = ${JSON.stringify(cron2state(simple))}`,
                        `convertCronToText('0 12 * * 1-5') = ${convertCronToText('0 12 * * 1-5', I18n.getLanguage())}`,
                        `convertCronToText('*/15 * * * *') = ${convertCronToText('*/15 * * * *', I18n.getLanguage())}`,
                    ].join('\n')}
                </pre>
            </DemoCard>
        </DemoPage>
    );
}
