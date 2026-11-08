import cronstrue from 'cronstrue';
import 'cronstrue/locales/fr';
import 'cronstrue/locales/es';
import 'cronstrue/locales/de';
import 'cronstrue/locales/it';
import 'cronstrue/locales/ru';
import 'cronstrue/locales/zh_CN';
import 'cronstrue/locales/uk';
import 'cronstrue/locales/pt_BR';
import 'cronstrue/locales/pl';
import 'cronstrue/locales/nl';

/** The languages that the description library has under another name */
const CRON_LOCALES: { [lang in ioBroker.Languages]?: string } = {
    pt: 'pt_BR',
    'zh-cn': 'zh_CN',
};

/** Allowed values of: seconds, minutes, hours, date, month, day of week (7 is Sunday too) */
const FIELD_RANGES = [
    [0, 59],
    [0, 59],
    [0, 23],
    [1, 31],
    [1, 12],
    [0, 7],
];

/** `*`, `5` or `5-7`, each with an optional step */
const NUMERIC_PART = /^(\*|(\d+)(?:-(\d+))?)(?:\/(\d*))?$/;

export function convertCronToText(cron: string, lang?: ioBroker.Languages): string {
    return cronstrue.toString(cron, { locale: (lang && CRON_LOCALES[lang]) || lang });
}

/** Splits the expression into 6 fields: an expression with 5 fields has the seconds at 0. */
function getCronFields(cron: string): string[] | null {
    const fields = cron.trim().split(/\s+/);
    if (fields.length === 5) {
        return ['0', ...fields];
    }
    return fields.length === 6 ? fields : null;
}

/** Checks the numbers of a part of a field, e.g. `5-7/2`. Returns null if the part has no numeric form. */
function getNumericPart(
    part: string,
    fieldIndex: number,
): { from: number; to: number; step: number; valid: boolean } | null {
    const match = NUMERIC_PART.exec(part);
    if (!match) {
        return null;
    }
    const [min, max] = FIELD_RANGES[fieldIndex];
    const hasStep = match[4] !== undefined;
    const step = hasStep ? parseInt(match[4], 10) : 1;
    const from = match[2] === undefined ? min : parseInt(match[2], 10);
    // `5/15` means from 5 till the end
    const to = match[2] === undefined ? max : match[3] !== undefined ? parseInt(match[3], 10) : hasStep ? max : from;

    return { from, to, step, valid: step >= 1 && from >= min && to <= max && from <= to };
}

/**
 * Checks if a scheduler can run this expression. Parts with names and special characters (`MON`, `L`, `#`, `?`) are
 * valid CRON, so only the description library decides about them.
 */
export function isValidCron(cron: string): boolean {
    // DialogCron can get a schedule of the wizard as an object
    const fields = typeof cron === 'string' ? getCronFields(cron) : null;
    if (!fields) {
        return false;
    }
    const partsValid = fields.every((field, fieldIndex) =>
        field.split(',').every(part => {
            const numeric = getNumericPart(part, fieldIndex);
            return numeric ? numeric.valid : /[A-Za-z?#]/.test(part) && !part.includes('_');
        }),
    );
    if (!partsValid) {
        return false;
    }
    try {
        convertCronToText(cron, 'en');
        return true;
    } catch {
        return false;
    }
}

/** All values of every field as text, or null if the expression is not just numbers */
function getCronValues(cron: string): string | null {
    const fields = getCronFields(cron);
    if (!fields) {
        return null;
    }
    const values: string[] = [];
    for (let fieldIndex = 0; fieldIndex < fields.length; fieldIndex++) {
        const list = new Set<number>();
        for (const part of fields[fieldIndex].split(',')) {
            const numeric = getNumericPart(part, fieldIndex);
            if (!numeric?.valid) {
                return null;
            }
            for (let value = numeric.from; value <= numeric.to; value += numeric.step) {
                // Sunday is 0 or 7
                list.add(fieldIndex === 5 && value === 7 ? 0 : value);
            }
        }
        values.push([...list].sort((a, b) => a - b).join(','));
    }
    return values.join(' ');
}

/** Checks if both expressions run at the same times, e.g. `15 8 * * 7` and `15 8 * * 0` */
export function isSameCron(cron1: string, cron2: string): boolean {
    if (cron1.trim() === cron2.trim()) {
        return true;
    }
    const values = getCronValues(cron1);
    return values !== null && values === getCronValues(cron2);
}
