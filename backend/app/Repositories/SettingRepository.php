<?php

declare(strict_types=1);

namespace App\Repositories;

use App\Models\Setting;
use App\Models\User;
use Illuminate\Support\Collection;

class SettingRepository
{
    private const APPLICATION_TYPES_KEY = 'application_types';

    private const RULES_KEY = 'rules';

    public function getApplicationTypes(): array
    {
        $setting = Setting::query()->find(self::APPLICATION_TYPES_KEY);

        return $setting?->value ?? [
            'server' => true,
            'police' => false,
            'ems' => false,
        ];
    }

    public function setApplicationTypes(array $types): array
    {
        Setting::query()->updateOrCreate(
            ['key' => self::APPLICATION_TYPES_KEY],
            ['value' => $types],
        );

        return $this->getApplicationTypes();
    }

    public function isApplicationTypeEnabled(string $type): bool
    {
        $types = $this->getApplicationTypes();

        return (bool) ($types[$type] ?? false);
    }

    public function getRules(): array
    {
        $setting = Setting::query()->find(self::RULES_KEY);
        $value = $setting?->value;

        if ($value === null) {
            return $this->defaultRules();
        }

        return $this->normalizeRules($value);
    }

    public function getRulesForType(string $type): array
    {
        $rules = $this->getRules();

        return $rules[$type] ?? $this->defaultRules()[$type];
    }

    public function setRules(array $rules): array
    {
        Setting::query()->updateOrCreate(
            ['key' => self::RULES_KEY],
            ['value' => $this->normalizeRules($rules)],
        );

        return $this->getRules();
    }

    private function normalizeRules(array $value): array
    {
        if (isset($value['en']) && isset($value['ar']) && ! isset($value['server'])) {
            $defaults = $this->defaultRules();
            $value = [
                'server' => $value,
                'police' => $defaults['police'],
                'ems' => $defaults['ems'],
            ];
        }

        $defaults = $this->defaultRules();

        return [
            'server' => $value['server'] ?? $defaults['server'],
            'police' => $value['police'] ?? $defaults['police'],
            'ems' => $value['ems'] ?? $defaults['ems'],
        ];
    }

    private function defaultRules(): array
    {
        return [
            'server' => $this->defaultServerRules(),
            'police' => $this->defaultPoliceRules(),
            'ems' => $this->defaultEmsRules(),
        ];
    }

    private function defaultServerRules(): array
    {
        return [
            'en' => [
                'title' => 'Server Rules',
                'subtitle' => 'Follow these guidelines to keep Aura Cfw enjoyable for everyone.',
                'content' => <<<'MD'
## General Conduct

- Respect all players and staff at all times.
- No harassment, discrimination, or hate speech.
- English in public channels; other languages in private RP.
- No metagaming — use only in-character knowledge.
- Report issues via Discord tickets, not in-game arguments.

## Roleplay Standards

- Stay in character at all times in the city.
- Value your life — don't act recklessly without reason.
- No random deathmatch (RDM) or vehicle deathmatch (VDM).
- New Life Rule applies after death — forget prior events.
- Quality over quantity — prioritize meaningful interactions.

## Combat & Crime

- Robberies and heists require proper RP buildup.
- Police must be given reasonable response time.
- No combat logging — remain in-game during active RP.
- Gang wars require staff approval for large-scale conflict.
- Exploiting bugs or glitches is strictly prohibited.
MD,
            ],
            'ar' => [
                'title' => 'قوانين السيرفر',
                'subtitle' => 'اتبع هذه الإرشادات للحفاظ على متعة Aura Cfw للجميع.',
                'content' => <<<'MD'
## السلوك العام

- احترم جميع اللاعبين والطاقم في جميع الأوقات.
- ممنوع التحرش أو التمييز أو خطاب الكراهية.
- الإنجليزية في القنوات العامة؛ لغات أخرى في RP خاص.
- ممنوع الميتاجيم — استخدم المعرفة داخل الشخصية فقط.
- أبلغ عن المشاكل عبر تذاكر Discord، وليس جدالات داخل اللعبة.

## معايير لعب الأدوار

- ابقَ في شخصيتك دائماً داخل المدينة.
- قدّر حياتك — لا تتصرف بتهور بدون سبب.
- ممنوع RDM أو VDM.
- قاعدة الحياة الجديدة بعد الموت — انسَ الأحداث السابقة.
- الجودة أهم من الكمية — أولِّ التفاعلات ذات المعنى.

## القتال والجريمة

- السرقات والعمليات تتطلب بناء RP مناسب.
- يجب إعطاء الشرطة وقت استجابة معقول.
- ممنوع combat logging — ابقَ في اللعبة أثناء RP نشط.
- حروب العصابات الكبيرة تتطلب موافقة الطاقم.
- استغلال الثغرات ممنوع تماماً.
MD,
            ],
        ];
    }

    private function defaultPoliceRules(): array
    {
        return [
            'en' => [
                'title' => 'Police Department Rules',
                'subtitle' => 'Standards and expectations for all Aura PD applicants and officers.',
                'content' => <<<'MD'
## Conduct

- Maintain professionalism on and off duty at all times.
- No corruption RP without prior command approval.
- Treat all citizens with respect unless RP dictates otherwise.
- Use force proportionally and document incidents when required.

## Operations

- Respond to calls with proper radio etiquette and unit coordination.
- Pursuits must consider public safety and server performance.
- Major operations require supervisor notification or approval.
- Evidence and arrests must follow server court and jail procedures.

## Application Requirements

- Minimum age 17 with mature RP behavior.
- Stable internet and working microphone required.
- Prior law enforcement RP experience is recommended.
- Read and agree to both server rules and PD regulations before applying.
MD,
            ],
            'ar' => [
                'title' => 'قوانين قسم الشرطة',
                'subtitle' => 'معايير وتوقعات لجميع المتقدمين والضباط في شرطة Aura.',
                'content' => <<<'MD'
## السلوك

- حافظ على الاحترافية داخل وخارج الخدمة في جميع الأوقات.
- ممنوع RP الفساد بدون موافقة القيادة مسبقاً.
- عامل جميع المواطنين باحترام ما لم يقتضِ الـ RP خلاف ذلك.
- استخدم القوة بشكل متناسب ووثّق الحوادث عند الحاجة.

## العمليات

- استجب للبلاغات بآداب اللاسلكي والتنسيق بين الوحدات.
- المطاردات يجب أن تراعي سلامة الجمهور وأداء السيرفر.
- العمليات الكبيرة تتطلب إخطار أو موافقة المشرف.
- الأدلة والاعتقالات يجب أن تتبع إجراءات المحكمة والسجن في السيرفر.

## متطلبات التقديم

- الحد الأدنى للعمر 17 مع سلوك RP ناضج.
- إنترنت مستقر وميكروفون يعمل مطلوبان.
- خبرة سابقة في RP أمني مُفضّلة.
- اقرأ ووافق على قوانين السيرفر والشرطة قبل التقديم.
MD,
            ],
        ];
    }

    private function defaultEmsRules(): array
    {
        return [
            'en' => [
                'title' => 'EMS Rules',
                'subtitle' => 'Medical roleplay standards for Aura EMS personnel.',
                'content' => <<<'MD'
## Patient Care

- Prioritize realistic medical RP over fast revives.
- Assess scenes for safety before entering active situations.
- Use appropriate treatment steps — no instant full heals without RP.
- Respect patient consent and privacy in medical RP.

## Operations

- Coordinate with police on active scenes when required.
- Keep radio traffic clear and use proper EMS call signs.
- Hospital handoffs must include brief patient history RP.
- Mass casualty events require command structure and triage RP.

## Application Requirements

- Minimum age 17 with calm and respectful communication.
- Working microphone required for emergency response RP.
- Basic understanding of EMS / medic roleplay is expected.
- Read and agree to both server rules and EMS regulations before applying.
MD,
            ],
            'ar' => [
                'title' => 'قوانين الإسعاف',
                'subtitle' => 'معايير RP الطبي لطاقم إسعاف Aura.',
                'content' => <<<'MD'
## رعاية المرضى

- أولِّ RP طبي واقعي على الإنعاش السريع.
- قيّم المشهد للسلامة قبل دخول المواقف النشطة.
- استخدم خطوات علاج مناسبة — لا شفاء فوري كامل بدون RP.
- احترم موافقة المريض وخصوصيته في RP الطبي.

## العمليات

- نسّق مع الشرطة في المشاهد النشطة عند الحاجة.
- حافظ على وضوح اللاسلكي واستخدم رموز نداء الإسعاف الصحيحة.
- تسليم المستشفى يجب أن يتضمن ملخصاً موجزاً لتاريخ المريض.
- حوادث الإصابات الجماعية تتطلب هيكل قيادة وفرز RP.

## متطلبات التقديم

- الحد الأدنى للعمر 17 مع تواصل هادئ ومحترم.
- ميكروفون يعمل مطلوب لـ RP الاستجابة للطوارئ.
- فهم أساسي لـ RP الإسعاف / الطبي متوقع.
- اقرأ ووافق على قوانين السيرفر والإسعاف قبل التقديم.
MD,
            ],
        ];
    }
}
