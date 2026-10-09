import type { ComponentType, SVGProps } from 'react';
import {
  AlignLeft,
  ArrowDown,
  ArrowLeftRight,
  ArrowUp,
  Calendar,
  ChartColumn,
  ChevronDown,
  ChevronLeft,
  ChevronsUpDown,
  CircleCheck,
  CircleMinus,
  CircleX,
  Clock,
  Copy,
  Cpu,
  EllipsisVertical,
  ExternalLink,
  FileText,
  Files,
  Filter as FilterIcon,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  GitPullRequestClosed,
  Info,
  Inbox,
  Link,
  LogOut,
  Menu as MenuIcon,
  Moon,
  Play,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Sun,
  Tag,
  Terminal,
  TriangleAlert,
  User,
  Wrench,
  X,
} from 'lucide-react';
import type { IconName } from '../types';

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

// Lucide dropped brand icons, so the GitHub mark stays a small custom SVG.
function GithubMark({ size = 16, className, ...rest }: SVGProps<SVGSVGElement> & { size?: number | string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      {...rest}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.12-.3-.54-1.53.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.23 0 4.63-2.81 5.65-5.49 5.95.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
    </svg>
  );
}

const ICONS: Record<IconName, IconComponent> = {
  github: GithubMark,
  external: ExternalLink,
  inbox: Inbox,
  gear: Settings,
  check: CircleCheck,
  cross: CircleX,
  dash: CircleMinus,
  restart: RotateCcw,
  calendar: Calendar,
  person: User,
  tag: Tag,
  link: Link,
  clock: Clock,
  cpu: Cpu,
  wrench: Wrench,
  fileText: FileText,
  files: Files,
  copy: Copy,
  info: Info,
  chart: ChartColumn,
  terminal: Terminal,
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  chevronLeft: ChevronLeft,
  chevronDown: ChevronDown,
  warning: TriangleAlert,
  shield: Shield,
  logout: LogOut,
  cardText: AlignLeft,
  expand: ChevronsUpDown,
  transfer: ArrowLeftRight,
  search: Search,
  filter: FilterIcon,
  close: X,
  menu: MenuIcon,
  more: EllipsisVertical,
  sun: Sun,
  moon: Moon,
  play: Play,
  gitPullRequest: GitPullRequest,
  gitPullRequestClosed: GitPullRequestClosed,
  gitMerge: GitMerge,
  gitBranch: GitBranch,
  gitCommit: GitCommit,
};

export interface IconProps {
  name: IconName;
  size?: number | string;
  className?: string;
  title?: string;
  strokeWidth?: number | string;
}

export function Icon({ name, size = 16, className, title, strokeWidth }: IconProps) {
  const Component = ICONS[name];
  if (!Component) return null;

  return (
    <Component
      size={size}
      className={className}
      strokeWidth={strokeWidth}
      focusable="false"
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
