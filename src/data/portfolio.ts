/**
 * PAPER WORLD — content layer.
 *
 * Every word a visitor reads comes from this file. The 3D scene only knows
 * hotspot ids and where they stand; all copy, structure and links live here.
 * Facts follow the brief (resume) exactly — no invented projects, clients or
 * numbers. Internal platform is never described as a public product.
 */

export type Locale = 'en' | 'ru';
export type Bi = { en: string; ru: string };

export const bi = (en: string, ru: string): Bi => ({ en, ru });

export interface Block {
  kind: 'p' | 'list' | 'metrics' | 'tags' | 'note';
  text?: Bi;
  /** list items: a bold lead (optional) and the sentence */
  items?: Bi[];
  metrics?: { value: string; label: Bi }[];
  tags?: string[];
  tagLabel?: Bi;
}

export interface LinkItem {
  label: string;
  href: string;
  hint?: Bi;
}

export interface Panel {
  id: string;
  eyebrow: Bi;
  title: Bi;
  lead: Bi;
  blocks: Block[];
  links?: LinkItem[];
  related?: string[];
}

export interface Hotspot {
  id: string;
  /** name on the paper sign in the 3D world */
  label: Bi;
  /** short hover hint */
  hint: Bi;
  /** camera framing, world units */
  target: [number, number, number];
  dist: number;
  panel: string;
  /** button label in the quick navigation, if the hotspot is a main district */
  nav?: Bi;
}

export const SITE = {
  name: 'VITALIY ALEXEEV',
  role: bi('Senior AI Platform Engineer', 'Senior AI Platform Engineer'),
  claim: bi('Building AI infrastructure for engineering teams.', 'Строю AI-инфраструктуру для инженерных команд.'),
  welcome: bi('Welcome to my world. Explore the objects to discover my story.', 'Добро пожаловать в мой мир. Исследуйте объекты, чтобы узнать мою историю.'),
  cta: bi('Click, explore, unfold.', 'Нажимайте, исследуйте, раскрывайте.'),
  message: bi('I build systems that help engineers build software.', 'Я строю системы, которые помогают инженерам создавать софт.'),
  tagline: bi('From frontend platforms to autonomous AI systems.', 'От frontend-платформ к автономным AI-системам.'),
};

export const UI = {
  nav: {
    about: bi('About', 'Обо мне'),
    experience: bi('Experience', 'Опыт'),
    t1: bi('AI Platform', 'AI-платформа'),
    stack: bi('Tech Stack', 'Стек'),
    contact: bi('Contact', 'Контакты'),
  },
  explore: bi('Explore', 'Открыть'),
  close: bi('Close', 'Закрыть'),
  back: bi('Back to overview', 'К общему плану'),
  reset: bi('Reset view', 'Сбросить вид'),
  hint: bi('Drag to look around · click an object · Esc closes', 'Тяните, чтобы осмотреться · нажмите на объект · Esc закрывает'),
  hintTouch: bi('Tap an object · drag to look around · pinch to zoom', 'Нажмите на объект · тяните, чтобы осмотреться · щипок — масштаб'),
  conveyor: {
    title: bi('Autonomous Agent Factory', 'Фабрика автономных агентов'),
    play: bi('Run the demo', 'Запустить демо'),
    replay: bi('Run again', 'Запустить снова'),
    stop: bi('Stop', 'Остановить'),
    demo: bi('Visual demonstration. No production agents are started.', 'Визуальная демонстрация. Production-агенты не запускаются.'),
    step: bi('Station', 'Станция'),
  },
  loading: {
    title: bi('Unfolding the paper world…', 'Разворачиваю бумажный мир…'),
    hint: bi('Cutting card, printing ink, folding hinges', 'Режу картон, печатаю тушь, сгибаю клапаны'),
    fallback: bi('This browser has no WebGL. The paper world needs it; the full experience is below as a list.', 'В этом браузере нет WebGL. Бумажному миру он нужен; полный опыт ниже — списком.'),
  },
  labels: {
    experience: bi('Experience', 'Опыт'),
    journey: bi('My Journey', 'Мой путь'),
    rnd: bi('R&D Lab', 'R&D-лаборатория'),
    mcp: bi('MCP Integration', 'MCP-интеграция'),
    telemetry: bi('LLM Telemetry', 'LLM-телеметрия'),
    workshop: bi('Tech Stack Workshop', 'Мастерская стека'),
    about: bi('About Me', 'Обо мне'),
    contact: bi('Contact Station', 'Почтовая станция'),
    factory: bi('T1 AI Factory', 'AI-фабрика T1'),
    ide: bi('IDE Station', 'IDE-станция'),
    agents: bi('Agent Factory', 'Фабрика агентов'),
    bench: bi('Benchmark Lab', 'Лаборатория бенчмарков'),
    security: bi('Platform Security', 'Безопасность платформы'),
  },
};

/* ---------------------------------------------------------------------------------------------- */
/* Hotspots: ids the 3D scene places. Camera framing and hover copy.                              */
/* ---------------------------------------------------------------------------------------------- */

export const HOTSPOTS: Hotspot[] = [
  {
    id: 'factory', label: UI.labels.factory, hint: bi('The internal AI platform', 'Внутренняя AI-платформа'),
    target: [0, 6.2, 1.6], dist: 70, panel: 't1', nav: UI.nav.t1,
  },
  {
    id: 'ide', label: UI.labels.ide, hint: bi('Two generations of IDE plugins', 'Два поколения IDE-плагинов'),
    target: [-17, 3.0, 2.2], dist: 30, panel: 'ide',
  },
  {
    id: 'agents', label: UI.labels.agents, hint: bi('Agents in action — run the demo', 'Агенты в действии — запустите демо'),
    target: [0, 2.6, 10.6], dist: 42, panel: 'agents',
  },
  {
    id: 'mcp', label: UI.labels.mcp, hint: bi('Three channels of context', 'Три канала контекста'),
    target: [29.4, 4.8, -1.6], dist: 48, panel: 'mcp',
  },
  {
    id: 'bench', label: UI.labels.bench, hint: bi('Harness, models, long context', 'Harness, модели, длинный контекст'),
    target: [24.5, 3.6, -13], dist: 44, panel: 'bench',
  },
  {
    id: 'telemetry', label: UI.labels.telemetry, hint: bi('HTTP → PostgreSQL → Kafka → S3', 'HTTP → PostgreSQL → Kafka → S3'),
    target: [23.8, 3.0, 10.6], dist: 46, panel: 'telemetry',
  },
  {
    id: 'security', label: UI.labels.security, hint: bi('OAuth2 + PKCE, role-based access', 'OAuth2 + PKCE, ролевой доступ'),
    target: [-15.2, 2.0, 1.4], dist: 22, panel: 'security',
  },
  {
    id: 'workshop', label: UI.labels.workshop, hint: bi('Tools grouped by craft', 'Инструменты по ремеслу'),
    target: [-23, 3.0, 20.2], dist: 40, panel: 'stack',
  },
  {
    id: 'about', label: UI.labels.about, hint: bi('Who is behind the paper', 'Кто за этим картоном'),
    target: [-25, 2.8, -18.4], dist: 38, panel: 'about',
  },
  {
    id: 'contact', label: UI.labels.contact, hint: bi('Post a letter', 'Отправить письмо'),
    target: [27, 2.4, 20.6], dist: 34, panel: 'contact',
  },
  {
    id: 'journey', label: UI.labels.journey, hint: bi('Frontend platforms → AI systems', 'Frontend-платформы → AI-системы'),
    target: [-28, 3.4, 10], dist: 52, panel: 'experience', nav: UI.nav.experience,
  },
  {
    id: 'remturbo', label: bi('REMTURBO · 2021', 'REMTURBO · 2021'), hint: bi('Frontend Developer', 'Frontend-разработчик'),
    target: [-28.6, 3.0, 16.0], dist: 34, panel: 'remturbo',
  },
  {
    id: 'quant', label: bi('Квант · 2022–2024', 'Квант · 2022–2024'), hint: bi('Platform workshop', 'Платформенная мастерская'),
    target: [-30.0, 3.2, 6.2], dist: 34, panel: 'quant',
  },
  {
    id: 'sistem', label: bi('1221Системс · 2024', '1221Системс · 2024'), hint: bi('CRM products for SPAR', 'CRM-продукты для SPAR'),
    target: [-25.4, 3.0, -13.2], dist: 34, panel: 'sistem',
  },
];

/* ---------------------------------------------------------------------------------------------- */
/* Panels                                                                                         */
/* ---------------------------------------------------------------------------------------------- */

const LINK_GITHUB: LinkItem = { label: 'github.com/vitjaz', href: 'https://github.com/vitjaz' };
const LINK_TG: LinkItem = { label: 't.me/vlad_ik_ok', href: 'https://t.me/vlad_ik_ok' };
const LINK_MAIL: LinkItem = { label: 'jameshudsonrandall@gmail.com', href: 'mailto:jameshudsonrandall@gmail.com' };
const LINK_SITE: LinkItem = { label: 'me.alexeev-blog.ru', href: 'https://me.alexeev-blog.ru/' };

export const PANELS: Record<string, Panel> = {
  t1: {
    id: 't1',
    eyebrow: bi('T1 · Dec 2024 — present', 'Т1 · декабрь 2024 — сейчас'),
    title: bi('Lead R&D developer', 'Главный разработчик R&D'),
    lead: bi('An internal AI platform for approximately 4,000 developers across the holding companies: IDE plugins with an agent mode, corporate MCP servers, autonomous AI agents, and telemetry and analytics for LLM calls.',
      'Внутренняя AI-платформа примерно для 4000 разработчиков компаний холдинга: IDE-плагины с агентским режимом, корпоративные MCP-сервера, автономные AI-агенты, телеметрия и аналитика LLM-вызовов.'),
    blocks: [
      { kind: 'metrics', metrics: [
        { value: '~4,000', label: bi('developers on the platform', 'разработчиков на платформе') },
        { value: '2', label: bi('generations of IDE plugins', 'поколения IDE-плагинов') },
        { value: '3', label: bi('context sources via MCP', 'источника контекста через MCP') },
      ] },
      { kind: 'p', text: bi('The factory in the middle of this world is that platform. Walk into its stations: the IDE hall, the agent conveyor, the MCP bridge, the benchmark bench and the telemetry plant.',
        'Фабрика в центре этого мира — это и есть платформа. Зайдите на её станции: IDE-зал, конвейер агентов, MCP-мост, стенд бенчмарков и завод телеметрии.') },
      { kind: 'note', text: bi('This is an internal engineering platform. It is not a public product.',
        'Это внутренняя инженерная платформа. Это не публичный продукт.') },
    ],
    related: ['ide', 'agents', 'mcp', 'bench', 'telemetry', 'security'],
  },

  ide: {
    id: 'ide',
    eyebrow: bi('T1 · IDE Station', 'Т1 · IDE-станция'),
    title: bi('Two generations, one UI core', 'Два поколения, одно UI-ядро'),
    lead: bi('Two generations of IDE plugins, used by approximately 4,000 developers. The first added chat with an LLM and autocomplete; the second added an agent mode that works in the repository, calls tools and handles multi-step tasks.',
      'Два поколения IDE-плагинов, которыми пользуются около 4000 разработчиков. Первое добавило чат с LLM и автокомплит; второе — агентский режим, который работает в репозитории, вызывает инструменты и ведёт многошаговые задачи.'),
    blocks: [
      { kind: 'list', items: [
        bi('Unified UI core — TypeScript and SolidJS for both VS Code and JetBrains (JCEF): two products on one codebase.', 'Единое UI-ядро — TypeScript и SolidJS для VS Code и JetBrains (JCEF): два продукта на одной кодовой базе.'),
        bi('SolidJS for fine-grained state — no unnecessary re-renders inside heavy IDE panels.', 'SolidJS для точечного управления состоянием — без лишних ререндеров в тяжёлых IDE-панелях.'),
        bi('Agent mode — repository work, tool calls and multi-step tasks instead of a single chat turn.', 'Агентский режим — работа в репозитории, вызов инструментов и многошаговые задачи вместо одного сообщения в чате.'),
      ] },
      { kind: 'tags', tagLabel: bi('Under the hood', 'Под капотом'), tags: ['TypeScript', 'SolidJS', 'VS Code Extension API', 'JetBrains Platform SDK', 'JCEF'] },
    ],
    related: ['agents', 'mcp'],
  },

  agents: {
    id: 'agents',
    eyebrow: bi('T1 · Autonomous Agent Factory', 'Т1 · Фабрика автономных агентов'),
    title: bi('From a tracker ticket to a pull request', 'От задачи в трекере до pull request'),
    lead: bi('A pipeline of specialised agents: the analyst studies the task and writes requirements into the knowledge base; the developer clones the repository into an isolated sandbox with the needed integrations, implements the feature and covers it with tests; the result comes back to a human as a pull request.',
      'Конвейер специализированных агентов: аналитик изучает задачу и фиксирует требования в базе знаний; разработчик клонирует репозиторий в изолированную песочницу с нужными интеграциями, реализует функциональность и покрывает её тестами; результат возвращается человеку в виде pull request.'),
    blocks: [
      { kind: 'p', text: bi('Questions are resolved inside the agent-to-agent chain. A human joins when there is no answer or when a control decision is required.',
        'Вопросы разрешаются внутри цепочки агент ↔ агент. Человек подключается, если ответа нет или нужно контрольное решение.') },
      { kind: 'metrics', metrics: [
        { value: 'week → hours', label: bi('pilot result: a project from scratch', 'результат пилота: проект с нуля') },
        { value: '8', label: bi('stages from ticket to review', 'этапов от задачи до ревью') },
      ] },
      { kind: 'note', text: bi('The conveyor above is a visual demonstration of how this works. No production agents are started by this page.',
        'Конвейер в сцене — визуальная демонстрация того, как это устроено. Эта страница не запускает production-агентов.') },
    ],
    related: ['mcp', 'bench', 'telemetry'],
  },

  mcp: {
    id: 'mcp',
    eyebrow: bi('T1 · MCP Integration Tower', 'Т1 · Башня MCP-интеграции'),
    title: bi('Three channels of context', 'Три канала контекста'),
    lead: bi('Corporate MCP servers expose the task tracker, the corporate Git and the knowledge system. Three key sources of context are available to agents directly: the task, the code and the internal documentation.',
      'Корпоративные MCP-сервера открывают таск-трекер, корпоративный Git и систему знаний. Три ключевых источника контекста доступны агентам напрямую: задача, код и внутренняя документация.'),
    blocks: [
      { kind: 'list', items: [
        bi('Called both by the IDE plugins and by the autonomous agent system.', 'Сервера вызываются и IDE-плагинами, и системой автономных агентов.'),
        bi('The bridges in the scene are those channels: task, code, documentation — running into the central factory.', 'Мосты в сцене — эти каналы: задача, код, документация — они сходятся к центральной фабрике.'),
      ] },
      { kind: 'tags', tagLabel: bi('Protocol', 'Протокол'), tags: ['MCP', 'Tools & resources', 'Internal services'] },
    ],
    related: ['ide', 'agents'],
  },

  bench: {
    id: 'bench',
    eyebrow: bi('T1 · R&D Lab', 'Т1 · R&D-лаборатория'),
    title: bi('Benchmarks and long context', 'Бенчмарки и длинный контекст'),
    lead: bi('An in-house benchmark harness in Python compares OpenCode, QwenCode and Hermes on internal tasks and on nl2repobench. The result depends on the model: OpenCode showed the strongest results with DeepSeek, QwenCode with Qwen.',
      'Собственный benchmark harness на Python сравнивает OpenCode, QwenCode и Hermes на внутренних задачах и на nl2repobench. Результат зависит от модели: OpenCode показал лучшие результаты на DeepSeek, QwenCode — на Qwen.'),
    blocks: [
      { kind: 'list', items: [
        bi('Context management for long tasks, built around the Spine method: decompose into subtasks and compress closed stages into compact result blocks.', 'Управление контекстом длинных задач по методу Spine: подзадачи и сжатие закрытых этапов в компактные блоки результатов.'),
        bi('The goal is to avoid context overflow and keep work with an agent stable across long tasks.', 'Цель — избежать переполнения контекста и сделать работу с агентом устойчивой на длинных задачах.'),
      ] },
      { kind: 'note', text: bi('No harness or model is universally best; the ranking follows the model it is paired with.',
        'Ни один harness или модель не лучше всегда: результат зависит от модели, с которой его сравнивают.') },
      { kind: 'tags', tagLabel: bi('Tools', 'Инструменты'), tags: ['Python', 'OpenCode', 'QwenCode', 'Hermes', 'nl2repobench', 'Spine'] },
    ],
    related: ['agents', 'ide'],
  },

  telemetry: {
    id: 'telemetry',
    eyebrow: bi('T1 · LLM Telemetry Center', 'Т1 · Центр LLM-телеметрии'),
    title: bi('Every LLM call leaves a trace', 'Каждый LLM-вызов оставляет след'),
    lead: bi('A pipeline of HTTP → PostgreSQL → Kafka → S3 records tens of thousands of entries per day. It supports the audit of actions and engineering metrics, including the share of code generated with AI.',
      'Пайплайн HTTP → PostgreSQL → Kafka → S3 записывает десятки тысяч записей в день. Он поддерживает аудит действий и инженерные метрики, включая долю кода, сгенерированного с помощью ИИ.'),
    blocks: [
      { kind: 'list', items: [
        bi('Analytics by developer, team and project.', 'Аналитика в разрезе разработчиков, команд и проектов.'),
        bi('Connected to all AI products of the holding.', 'Сервис подключён ко всем AI-продуктам холдинга.'),
      ] },
      { kind: 'tags', tagLabel: bi('Pipeline', 'Пайплайн'), tags: ['HTTP', 'PostgreSQL', 'Kafka', 'S3'] },
    ],
    related: ['agents', 'security'],
  },

  security: {
    id: 'security',
    eyebrow: bi('T1 · Platform Security', 'Т1 · Безопасность платформы'),
    title: bi('Access that fits the platform', 'Доступ, соответствующий платформе'),
    lead: bi('Corporate authorization with OAuth2 Authorization Code Flow and PKCE, and role-based access to the internal services of the platform.',
      'Корпоративная авторизация по OAuth2 Authorization Code Flow + PKCE и ролевой доступ к внутренним сервисам платформы.'),
    blocks: [
      { kind: 'tags', tagLabel: bi('Implemented with', 'Реализовано через'), tags: ['OAuth2', 'PKCE', 'RBAC'] },
      { kind: 'p', text: bi('The gatehouse beside the factory stands for this layer: every station inside is reached through it.',
        'Сторожка рядом с фабрикой — этот слой: любая станция внутри доступна только через него.') },
    ],
    related: ['t1'],
  },

  remturbo: {
    id: 'remturbo',
    eyebrow: bi('REMTURBO · 2021', 'REMTURBO · 2021'),
    title: bi('Frontend Developer', 'Frontend-разработчик'),
    lead: bi('A monitoring station for power equipment: a dashboard for the CHP plant, built in React.',
      'Станция мониторинга энергетического оборудования: дашборд для ТЭЦ на React.'),
    blocks: [
      { kind: 'list', items: [
        bi('Equipment monitoring dashboard for a CHP plant.', 'Дашборд мониторинга оборудования ТЭЦ.'),
        bi('Real-time statistics and charts that help engineers notice pre-emergency states.', 'Статистика и графики в реальном времени, помогающие инженерам замечать предаварийные состояния.'),
        bi('Integration UI for the Trassir access-control system: working-time tracking and analytical reports.', 'Интерфейс интеграции со СКУД Trassir: учёт рабочего времени и аналитические отчёты.'),
      ] },
      { kind: 'tags', tags: ['React'] },
    ],
    related: ['quant', 't1'],
  },

  quant: {
    id: 'quant',
    eyebrow: bi('Квант · Jan 2022 — Sep 2024', 'Квант · январь 2022 — сентябрь 2024'),
    title: bi('Developer · platform workshop', 'Разработчик · платформенная мастерская'),
    lead: bi('Three years of platform work: a large migration, a design system, server-side products, developer tooling and an analytics service — the workshop where reusable pieces are cut and assembled.',
      'Три года платформенной работы: крупная миграция, дизайн-система, серверные продукты, инструменты разработчика и аналитический сервис — мастерская, где вырезают и собирают переиспользуемые детали.'),
    blocks: [
      { kind: 'list', items: [
        bi('Vue 2 → Vue 3 migration of a large application: Options API / Webpack → Composition API / Vite. Build time went from 5 minutes to 45 seconds.', 'Миграция крупного приложения Vue 2 → Vue 3: Options API / Webpack → Composition API / Vite. Сборка ускорилась с 5 минут до 45 секунд.'),
        bi('Corporate UI Kit for Vue 3 / Nuxt 3, used by three frontend teams.', 'Корпоративный UI Kit для Vue 3 / Nuxt 3, используемый тремя frontend-командами.'),
        bi('SSR employee search on Nuxt 3 + NestJS, around 500 users, with role-based access and Microsoft Teams and Outlook integrations.', 'SSR-сервис поиска сотрудников на Nuxt 3 + NestJS, около 500 пользователей, с ролевым доступом и интеграциями с Microsoft Teams и Outlook.'),
        bi('Corporate CLI: a new frontend project in 15 minutes instead of 2 days — architecture, ADFS, CI/CD, logging and linters out of the box.', 'Корпоративная CLI: создание frontend-проекта за 15 минут вместо 2 дней — архитектура, ADFS, CI/CD, логирование и линтеры из коробки.'),
        bi('Qmetr — engineering analytics system: Vue 3, Chart.js, Express; API and architecture, sprint metrics for team retrospectives.', 'Qmetr — система инженерной аналитики: Vue 3, Chart.js, Express; API и архитектура, метрики спринтов для командных ретроспектив.'),
      ] },
      { kind: 'metrics', metrics: [
        { value: '5 min → 45 s', label: bi('production build', 'production-сборка') },
        { value: '15 min', label: bi('new project instead of 2 days', 'новый проект вместо 2 дней') },
        { value: '~500', label: bi('users of the employee search', 'пользователей поиска сотрудников') },
      ] },
      { kind: 'tags', tagLabel: bi('Stack', 'Стек'), tags: ['Vue 3', 'Nuxt 3', 'NestJS', 'Vite', 'Chart.js', 'Express'] },
    ],
    related: ['sistem', 't1'],
  },

  sistem: {
    id: 'sistem',
    eyebrow: bi('1221Системс · Sep 2024 — Dec 2024', '1221Системс · сентябрь 2024 — декабрь 2024'),
    title: bi('Frontend Developer · CRM pavilion', 'Frontend-разработчик · CRM-павильон'),
    lead: bi('Internal CRM systems for the SPAR retail network. Four months of parallel migration, redesign and new functionality.',
      'Внутренние CRM-системы сети SPAR. Четыре месяца параллельной миграции, редизайна и новой функциональности.'),
    blocks: [
      { kind: 'list', items: [
        bi('Migrated a CRM from Vue 2 to Vue 3 alongside a redesign and new features for promotions and regional discounts; the result was accepted by the client on time.', 'Мигрировал CRM с Vue 2 на Vue 3 параллельно с редизайном и новыми функциями управления акциями и региональными скидками; результат принят заказчиком в срок.'),
        bi('In a second CRM on Vue 3, set up unit testing from scratch: Vitest infrastructure and coverage of the key functionality.', 'Во второй CRM на Vue 3 поднял unit-тестирование с нуля: инфраструктура Vitest и покрытие ключевого функционала.'),
      ] },
      { kind: 'tags', tagLabel: bi('Stack', 'Стек'), tags: ['Vue 3', 'Vitest'] },
    ],
    related: ['quant', 't1'],
  },

  stack: {
    id: 'stack',
    eyebrow: bi('Tech Stack Workshop', 'Мастерская технологий'),
    title: bi('Tools, grouped by craft', 'Инструменты, сгруппированные по ремеслу'),
    lead: bi('Not a wall of logos: four benches, each holding the tools this work actually uses.',
      'Не стена логотипов: четыре верстака, на каждом — инструменты, которые эта работа действительно использует.'),
    blocks: [
      { kind: 'tags', tagLabel: bi('Frontend', 'Frontend'), tags: ['TypeScript', 'JavaScript', 'Vue', 'React', 'SolidJS', 'Nuxt', 'Pinia', 'Redux', 'Vite', 'Vitest', 'Webpack'] },
      { kind: 'tags', tagLabel: bi('Backend', 'Backend'), tags: ['Node.js', 'Python', 'Express', 'PostgreSQL', 'Prisma', 'OpenAPI'] },
      { kind: 'tags', tagLabel: bi('AI engineering', 'AI-инженерия'), tags: ['LLM', 'AI Agents', 'MCP', 'RAG', 'Benchmark harnesses', 'Context engineering'] },
      { kind: 'tags', tagLabel: bi('Infrastructure & integration', 'Инфраструктура и интеграции'), tags: ['Apache Kafka', 'Docker', 'CI/CD', 'OAuth2', 'VS Code Extension API', 'JetBrains Platform SDK'] },
      { kind: 'note', text: bi('These are the tools the resume names. No proficiency level is implied beyond what the work described here shows.',
        'Это инструменты, названные в резюме. Уровень владения не подразумевается выше того, что показывает описанная здесь работа.') },
    ],
    related: ['t1', 'quant'],
  },

  about: {
    id: 'about',
    eyebrow: bi('About Me', 'Обо мне'),
    title: bi('Vitaliy Alexeev', 'Виталий Алексеев'),
    lead: bi('I build AI infrastructure for engineering organizations — from IDE assistants and enterprise MCP integrations to autonomous software engineering agents and LLM telemetry. At T1, I helped build an internal AI platform used by approximately 4,000 developers. My background spans frontend platforms, developer tooling, backend services, and applied AI engineering.',
      'Я строю AI-инфраструктуру для инженерных организаций — от IDE-ассистентов и корпоративных MCP-интеграций до автономных агентов-разработчиков и телеметрии LLM. В Т1 я участвовал в создании внутренней AI-платформы, которой пользуются около 4000 разработчиков. Мой опыт охватывает frontend-платформы, инструменты разработчика, backend-сервисы и прикладную AI-инженерию.'),
    blocks: [
      { kind: 'p', text: SITE.tagline },
      { kind: 'metrics', metrics: [
        { value: '2021', label: bi('first frontend role', 'первая frontend-роль') },
        { value: '2024', label: bi('R&D at T1', 'R&D в Т1') },
        { value: '~4,000', label: bi('developers on the platform', 'разработчиков на платформе') },
      ] },
      { kind: 'p', text: SITE.message },
    ],
    related: ['quant', 't1', 'contact'],
  },

  contact: {
    id: 'contact',
    eyebrow: bi('Contact Station', 'Почтовая станция'),
    title: bi('Send a letter', 'Отправьте письмо'),
    lead: bi('The station is open. Pick a channel — every link opens in a new tab, and the mailbox writes an email.',
      'Станция открыта. Выберите канал — все ссылки открываются в новой вкладке, а почтовый ящик создаёт письмо.'),
    blocks: [
      { kind: 'p', text: bi('Open to conversations about AI platforms, developer tooling and engineering infrastructure.',
        'Открыт к разговорам об AI-платформах, инструментах разработчика и инженерной инфраструктуре.') },
    ],
    links: [LINK_GITHUB, LINK_TG, LINK_MAIL, LINK_SITE],
    related: ['about'],
  },
};

/** Career timeline: the quick-access panel behind the Experience chip and the My Journey sign. */
PANELS.experience = {
  id: 'experience',
  eyebrow: bi('My Journey · 2021 — present', 'Мой путь · 2021 — сейчас'),
  title: bi('From frontend platforms to AI systems', 'От frontend-платформ к AI-системам'),
  lead: bi('Four roles in five years: monitoring dashboards for power equipment, a platform workshop and design system, CRM products for retail, and the internal AI platform at T1.',
    'Четыре роли за пять лет: дашборды мониторинга энергооборудования, платформенная мастерская и дизайн-система, CRM-продукты для ритейла и внутренняя AI-платформа в Т1.'),
  blocks: [
    { kind: 'p', text: bi('Pick a stop on the road, or open any position below. Each stop is a real paper building with the facts of that role.',
      'Выберите остановку на дороге или откройте любую позицию ниже. Каждая остановка — настоящая бумажная постройка с фактами этой роли.') },
    { kind: 'metrics', metrics: [
      { value: '4', label: bi('companies', 'компании') },
      { value: '1', label: bi('line: frontend → AI', 'линия: frontend → AI') },
      { value: '~4,000', label: bi('developers reached at T1', 'разработчиков в Т1') },
    ] },
  ],
  related: ['remturbo', 'quant', 'sistem', 't1'],
};

/** Everything a recruiter needs without exploring the model, in one list. */
export const EXPERIENCE_ORDER: { panel: string; job: string; period: string }[] = [
  { panel: 't1', job: 'T1 — Lead R&D developer', period: 'Dec 2024 — present' },
  { panel: 'sistem', job: '1221Системс — Frontend Developer', period: 'Sep 2024 — Dec 2024' },
  { panel: 'quant', job: 'Квант — Developer', period: 'Jan 2022 — Sep 2024' },
  { panel: 'remturbo', job: 'REMTURBO — Frontend Developer', period: '2021' },
];
