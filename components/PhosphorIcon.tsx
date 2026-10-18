import * as React from "react";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import { ArrowRightIcon } from "@phosphor-icons/react/dist/csr/ArrowRight";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { ArrowUpIcon } from "@phosphor-icons/react/dist/csr/ArrowUp";
import { ArrowDownIcon } from "@phosphor-icons/react/dist/csr/ArrowDown";
import { ArrowUpRightIcon } from "@phosphor-icons/react/dist/csr/ArrowUpRight";
import { ArrowDownRightIcon } from "@phosphor-icons/react/dist/csr/ArrowDownRight";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretUpIcon } from "@phosphor-icons/react/dist/csr/CaretUp";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { CaretDoubleRightIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleRight";
import { CaretDoubleLeftIcon } from "@phosphor-icons/react/dist/csr/CaretDoubleLeft";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { CheckCircleIcon } from "@phosphor-icons/react/dist/csr/CheckCircle";
import { XCircleIcon } from "@phosphor-icons/react/dist/csr/XCircle";
import { WarningIcon } from "@phosphor-icons/react/dist/csr/Warning";
import { WarningCircleIcon } from "@phosphor-icons/react/dist/csr/WarningCircle";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { QuestionIcon } from "@phosphor-icons/react/dist/csr/Question";
import { ListIcon } from "@phosphor-icons/react/dist/csr/List";
import { DotsThreeIcon } from "@phosphor-icons/react/dist/csr/DotsThree";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { SlidersHorizontalIcon } from "@phosphor-icons/react/dist/csr/SlidersHorizontal";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { SortAscendingIcon } from "@phosphor-icons/react/dist/csr/SortAscending";
import { SortDescendingIcon } from "@phosphor-icons/react/dist/csr/SortDescending";
import { HouseIcon } from "@phosphor-icons/react/dist/csr/House";
import { UserIcon } from "@phosphor-icons/react/dist/csr/User";
import { UsersIcon } from "@phosphor-icons/react/dist/csr/Users";
import { UserPlusIcon } from "@phosphor-icons/react/dist/csr/UserPlus";
import { GearIcon } from "@phosphor-icons/react/dist/csr/Gear";
import { BellIcon } from "@phosphor-icons/react/dist/csr/Bell";
import { CalendarIcon } from "@phosphor-icons/react/dist/csr/Calendar";
import { ClockIcon } from "@phosphor-icons/react/dist/csr/Clock";
import { MapPinIcon } from "@phosphor-icons/react/dist/csr/MapPin";
import { GlobeIcon } from "@phosphor-icons/react/dist/csr/Globe";
import { LinkIcon } from "@phosphor-icons/react/dist/csr/Link";
import { CopyIcon } from "@phosphor-icons/react/dist/csr/Copy";
import { ShareNetworkIcon } from "@phosphor-icons/react/dist/csr/ShareNetwork";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/csr/Envelope";
import { PhoneIcon } from "@phosphor-icons/react/dist/csr/Phone";
import { ChatCircleIcon } from "@phosphor-icons/react/dist/csr/ChatCircle";
import { PaperPlaneTiltIcon } from "@phosphor-icons/react/dist/csr/PaperPlaneTilt";
import { DownloadIcon } from "@phosphor-icons/react/dist/csr/Download";
import { UploadIcon } from "@phosphor-icons/react/dist/csr/Upload";
import { FileIcon } from "@phosphor-icons/react/dist/csr/File";
import { FileTextIcon } from "@phosphor-icons/react/dist/csr/FileText";
import { FolderIcon } from "@phosphor-icons/react/dist/csr/Folder";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { FloppyDiskIcon } from "@phosphor-icons/react/dist/csr/FloppyDisk";
import { EyeIcon } from "@phosphor-icons/react/dist/csr/Eye";
import { EyeSlashIcon } from "@phosphor-icons/react/dist/csr/EyeSlash";
import { LockIcon } from "@phosphor-icons/react/dist/csr/Lock";
import { LockOpenIcon } from "@phosphor-icons/react/dist/csr/LockOpen";
import { PlayIcon } from "@phosphor-icons/react/dist/csr/Play";
import { PauseIcon } from "@phosphor-icons/react/dist/csr/Pause";
import { StopIcon } from "@phosphor-icons/react/dist/csr/Stop";
import { SpeakerHighIcon } from "@phosphor-icons/react/dist/csr/SpeakerHigh";
import { SpeakerSlashIcon } from "@phosphor-icons/react/dist/csr/SpeakerSlash";
import { StarIcon } from "@phosphor-icons/react/dist/csr/Star";
import { HeartIcon } from "@phosphor-icons/react/dist/csr/Heart";
import { BookmarkSimpleIcon } from "@phosphor-icons/react/dist/csr/BookmarkSimple";
import { ImageIcon } from "@phosphor-icons/react/dist/csr/Image";
import { CameraIcon } from "@phosphor-icons/react/dist/csr/Camera";
import { VideoCameraIcon } from "@phosphor-icons/react/dist/csr/VideoCamera";
import { ArrowSquareOutIcon } from "@phosphor-icons/react/dist/csr/ArrowSquareOut";
import { SignInIcon } from "@phosphor-icons/react/dist/csr/SignIn";
import { SignOutIcon } from "@phosphor-icons/react/dist/csr/SignOut";
import { InstagramLogoIcon } from "@phosphor-icons/react/dist/csr/InstagramLogo";
import { TelegramLogoIcon } from "@phosphor-icons/react/dist/csr/TelegramLogo";
import { YoutubeLogoIcon } from "@phosphor-icons/react/dist/csr/YoutubeLogo";
import { WhatsappLogoIcon } from "@phosphor-icons/react/dist/csr/WhatsappLogo";
import { LinkedinLogoIcon } from "@phosphor-icons/react/dist/csr/LinkedinLogo";
import { FacebookLogoIcon } from "@phosphor-icons/react/dist/csr/FacebookLogo";
import { XLogoIcon } from "@phosphor-icons/react/dist/csr/XLogo";
import { UserCircleIcon } from "@phosphor-icons/react/dist/csr/UserCircle";
import { UsersThreeIcon } from "@phosphor-icons/react/dist/csr/UsersThree";
import { TreeStructureIcon } from "@phosphor-icons/react/dist/csr/TreeStructure";
import { PresentationChartIcon } from "@phosphor-icons/react/dist/csr/PresentationChart";
import { MegaphoneIcon } from "@phosphor-icons/react/dist/csr/Megaphone";
import { UserSoundIcon } from "@phosphor-icons/react/dist/csr/UserSound";
import { RocketLaunchIcon } from "@phosphor-icons/react/dist/csr/RocketLaunch";
import { MicrophoneStageIcon } from "@phosphor-icons/react/dist/csr/MicrophoneStage";
import { HandshakeIcon } from "@phosphor-icons/react/dist/csr/Handshake";
import { KanbanIcon } from "@phosphor-icons/react/dist/csr/Kanban";
import { CompassToolIcon } from "@phosphor-icons/react/dist/csr/CompassTool";
import { VectorThreeIcon } from "@phosphor-icons/react/dist/csr/VectorThree";
import { BinocularsIcon } from "@phosphor-icons/react/dist/csr/Binoculars";
import { ChartLineUpIcon } from "@phosphor-icons/react/dist/csr/ChartLineUp";
import { GraphIcon } from "@phosphor-icons/react/dist/csr/Graph";
import { DnaIcon } from "@phosphor-icons/react/dist/csr/Dna";
import { SailboatIcon } from "@phosphor-icons/react/dist/csr/Sailboat";
import { PottedPlantIcon } from "@phosphor-icons/react/dist/csr/PottedPlant";
import { SoccerBallIcon } from "@phosphor-icons/react/dist/csr/SoccerBall";
import { CalendarDotsIcon } from "@phosphor-icons/react/dist/csr/CalendarDots";

export const PHOSPHOR_ICON_NAMES = [
  "ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "ArrowUpRight",
  "ArrowDownRight", "CaretRight", "CaretLeft", "CaretUp", "CaretDown",
  "CaretDoubleRight", "CaretDoubleLeft", "X", "Plus", "Minus", "Check",
  "CheckCircle", "XCircle", "Warning", "WarningCircle", "Info", "Question",
  "List", "DotsThree", "DotsThreeVertical", "MagnifyingGlass",
  "SlidersHorizontal", "Funnel", "SortAscending", "SortDescending", "House",
  "User", "Users", "UserPlus", "Gear", "Bell", "Calendar", "Clock",
  "MapPin", "Globe", "Link", "Copy", "ShareNetwork", "Envelope", "Phone",
  "ChatCircle", "PaperPlaneTilt", "Download", "Upload", "File", "FileText",
  "Folder", "Trash", "PencilSimple", "FloppyDisk", "Eye", "EyeSlash",
  "Lock", "LockOpen", "Play", "Pause", "Stop", "SpeakerHigh",
  "SpeakerSlash", "Star", "Heart", "BookmarkSimple", "Image", "Camera",
  "VideoCamera", "ArrowSquareOut", "SignIn", "SignOut", "InstagramLogo",
  "TelegramLogo", "YoutubeLogo", "WhatsappLogo", "LinkedinLogo", "FacebookLogo",
  "XLogo", "UserCircle", "UsersThree", "TreeStructure", "PresentationChart",
  "Megaphone", "UserSound", "RocketLaunch", "MicrophoneStage", "Handshake",
  "Kanban", "CompassTool", "VectorThree", "Binoculars", "ChartLineUp",
  "Graph", "Dna", "Sailboat", "PottedPlant", "SoccerBall", 'CalendarDots',
] as const;

export type PhosphorIconName = (typeof PHOSPHOR_ICON_NAMES)[number];

export type PhosphorGradientStop = {
  color: string;
  offset: number;
};

export const DEFAULT_PHOSPHOR_GRADIENT_STOPS: PhosphorGradientStop[] = [
  { color: "var(--Brand-Brand-50, #007EF7)", offset: 0 },
  { color: "var(--Brand-Brand-100, #00BAF5)", offset: 31.2 },
  { color: "#DAEFF4", offset: 80.49 },
  {
    color: "var(--Achroma-Light-Light-100, #F2F2F2)",
    offset: 94.06,
  },
];

const ICONS: Record<PhosphorIconName, Icon> = {
  ArrowRight: ArrowRightIcon, ArrowLeft: ArrowLeftIcon, ArrowUp: ArrowUpIcon,
  ArrowDown: ArrowDownIcon, ArrowUpRight: ArrowUpRightIcon,
  ArrowDownRight: ArrowDownRightIcon, CaretRight: CaretRightIcon,
  CaretLeft: CaretLeftIcon, CaretUp: CaretUpIcon, CaretDown: CaretDownIcon,
  CaretDoubleRight: CaretDoubleRightIcon, CaretDoubleLeft: CaretDoubleLeftIcon,
  X: XIcon, Plus: PlusIcon, Minus: MinusIcon, Check: CheckIcon,
  CheckCircle: CheckCircleIcon, XCircle: XCircleIcon, Warning: WarningIcon,
  WarningCircle: WarningCircleIcon, Info: InfoIcon, Question: QuestionIcon,
  List: ListIcon, DotsThree: DotsThreeIcon,
  DotsThreeVertical: DotsThreeVerticalIcon, MagnifyingGlass: MagnifyingGlassIcon,
  SlidersHorizontal: SlidersHorizontalIcon, Funnel: FunnelIcon,
  SortAscending: SortAscendingIcon, SortDescending: SortDescendingIcon,
  House: HouseIcon, User: UserIcon, Users: UsersIcon, UserPlus: UserPlusIcon,
  Gear: GearIcon, Bell: BellIcon, Calendar: CalendarIcon, Clock: ClockIcon,
  MapPin: MapPinIcon, Globe: GlobeIcon, Link: LinkIcon, Copy: CopyIcon,
  ShareNetwork: ShareNetworkIcon, Envelope: EnvelopeIcon, Phone: PhoneIcon,
  ChatCircle: ChatCircleIcon, PaperPlaneTilt: PaperPlaneTiltIcon,
  Download: DownloadIcon, Upload: UploadIcon, File: FileIcon,
  FileText: FileTextIcon, Folder: FolderIcon, Trash: TrashIcon,
  PencilSimple: PencilSimpleIcon, FloppyDisk: FloppyDiskIcon, Eye: EyeIcon,
  EyeSlash: EyeSlashIcon, Lock: LockIcon, LockOpen: LockOpenIcon, Play: PlayIcon,
  Pause: PauseIcon, Stop: StopIcon, SpeakerHigh: SpeakerHighIcon,
  SpeakerSlash: SpeakerSlashIcon, Star: StarIcon, Heart: HeartIcon,
  BookmarkSimple: BookmarkSimpleIcon, Image: ImageIcon, Camera: CameraIcon,
  VideoCamera: VideoCameraIcon, ArrowSquareOut: ArrowSquareOutIcon,
  SignIn: SignInIcon, SignOut: SignOutIcon, InstagramLogo: InstagramLogoIcon,
  TelegramLogo: TelegramLogoIcon, YoutubeLogo: YoutubeLogoIcon,
  WhatsappLogo: WhatsappLogoIcon,
  LinkedinLogo: LinkedinLogoIcon, FacebookLogo: FacebookLogoIcon, XLogo: XLogoIcon,
  UserCircle: UserCircleIcon, UsersThree: UsersThreeIcon,
  TreeStructure: TreeStructureIcon, PresentationChart: PresentationChartIcon,
  Megaphone: MegaphoneIcon, UserSound: UserSoundIcon,
  RocketLaunch: RocketLaunchIcon, MicrophoneStage: MicrophoneStageIcon,
  Handshake: HandshakeIcon, Kanban: KanbanIcon, CompassTool: CompassToolIcon,
  VectorThree: VectorThreeIcon, Binoculars: BinocularsIcon,
  ChartLineUp: ChartLineUpIcon, Graph: GraphIcon, Dna: DnaIcon,
  Sailboat: SailboatIcon, PottedPlant: PottedPlantIcon, SoccerBall: SoccerBallIcon, CalendarDots: CalendarDotsIcon,
};

export type PhosphorIconProps = {
  iconName?: PhosphorIconName | string;
  size?: number;
  color?: string;
  useGradient?: boolean;
  gradientAngle?: number;
  gradientStops?: PhosphorGradientStop[];
  weight?: IconWeight;
  mirrored?: boolean;
  decorative?: boolean;
  ariaLabel?: string;
  className?: string;
};

export function PhosphorIcon({
  iconName = "ArrowRight",
  size = 24,
  color = "currentColor",
  useGradient = false,
  gradientAngle = 180,
  gradientStops = DEFAULT_PHOSPHOR_GRADIENT_STOPS,
  weight = "regular",
  mirrored = false,
  decorative = true,
  ariaLabel,
  className,
}: PhosphorIconProps) {
  const IconComponent =
    ICONS[iconName as PhosphorIconName] ?? ArrowRightIcon;
  const instanceId = React.useId().replace(/:/g, "");

  if (useGradient) {
    const angle = Number.isFinite(gradientAngle) ? gradientAngle : 180;
    const radians = (angle * Math.PI) / 180;
    const dx = Math.sin(radians);
    const dy = -Math.cos(radians);
    const scale = Math.abs(dx) + Math.abs(dy);
    const round = (value: number) => Math.round(value * 10000) / 10000;
    const x1 = round(50 - dx * 50 * scale);
    const y1 = round(50 - dy * 50 * scale);
    const x2 = round(50 + dx * 50 * scale);
    const y2 = round(50 + dy * 50 * scale);
    const validStops = gradientStops.filter(
      (stop) =>
        stop &&
        typeof stop.color === "string" &&
        stop.color.trim().length > 0 &&
        Number.isFinite(stop.offset)
    );
    const resolvedStops =
      validStops.length > 0 ? validStops : DEFAULT_PHOSPHOR_GRADIENT_STOPS;
    const gradientId = `phosphor-gradient-${instanceId}`;
    const maskId = `phosphor-mask-${instanceId}`;

    return (
      <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 256 256"
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : ariaLabel || iconName}
        role={decorative ? undefined : "img"}
        focusable={false}
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1={`${x1}%`}
            y1={`${y1}%`}
            x2={`${x2}%`}
            y2={`${y2}%`}
          >
            {resolvedStops.map((stop, index) => (
              <stop
                key={`${stop.offset}-${index}`}
                offset={`${Math.min(100, Math.max(0, stop.offset))}%`}
                stopColor={stop.color}
              />
            ))}
          </linearGradient>
          <mask
            id={maskId}
            x="0"
            y="0"
            width="256"
            height="256"
            maskUnits="userSpaceOnUse"
          >
            <IconComponent
              size={256}
              color="#ffffff"
              weight={weight}
              mirrored={mirrored}
              aria-hidden
            />
          </mask>
        </defs>
        <rect
          width="256"
          height="256"
          fill={`url(#${gradientId})`}
          mask={`url(#${maskId})`}
        />
      </svg>
    );
  }

  return (
    <IconComponent
      className={className}
      size={size}
      color={color}
      weight={weight}
      mirrored={mirrored}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : ariaLabel || iconName}
      role={decorative ? undefined : "img"}
      focusable={false}
    />
  );
}

export default PhosphorIcon;
