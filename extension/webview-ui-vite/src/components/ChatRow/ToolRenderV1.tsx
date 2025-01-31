/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { vscode } from "@/utils/vscode"
import { AnimatePresence, motion } from "framer-motion"
import {
	AlertCircle,
	CheckCircle,
	ChevronDown,
	ChevronUp,
	Code,
	Edit,
	FileText,
	FolderTree,
	HelpCircle,
	Image,
	LoaderPinwheel,
	MessageCircle,
	MessageCircleReply,
	Play,
	RefreshCw,
	Scissors,
	Search,
	Server,
	Square,
	Terminal,
	XCircle,
} from "lucide-react"
import React, { memo, useEffect, useRef, useState } from "react"
import {
	AskConsultantTool,
	AskFollowupQuestionTool,
	AttemptCompletionTool,
	ChatTool,
	ExecuteCommandTool,
	ListCodeDefinitionNamesTool,
	ListFilesTool,
	ReadFileTool,
	SearchFilesTool,
	ServerRunnerTool,
	UrlScreenshotTool,
	WriteToFileTool,
} from "../../../../src/shared/new-tools"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible"
import { ScrollArea, ScrollBar } from "../ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { EnhancedWebSearchBlock } from "./Tools/WebSearchTool"

type ApprovalState = ToolStatus
export type ToolAddons = {
	approvalState?: ApprovalState
	ts: number
	onApprove?: () => void
	onReject?: (feedback: string) => void
	/**
	 * If this is a sub message, it will force it to stick to previous tool call in the ui (same message)
	 */
	isSubMsg?: boolean
	userFeedback?: string
}
type ToolBlockProps = {
	icon: React.FC<React.SVGProps<SVGSVGElement>>
	title: string
	children: React.ReactNode
	tool: ChatTool["tool"]
	variant: "default" | "primary" | "info" | "accent" | "info" | "success" | "info" | "destructive"
} & ToolAddons

export const ToolBlock: React.FC<ToolBlockProps> = ({
	icon: Icon,
	title,
	children,
	variant,
	isSubMsg,
	approvalState,
	userFeedback,
}) => {
	variant =
		approvalState === "loading"
			? "info"
			: approvalState === "error" || approvalState === "rejected"
			? "destructive"
			: approvalState === "approved"
			? "success"
			: variant
	const stateIcons = {
		pending: <AlertCircle className="w-5 h-5 text-info" />,
		approved: <CheckCircle className="w-5 h-5 text-success" />,
		rejected: <XCircle className="w-5 h-5 text-destructive" />,
		error: <AlertCircle className="w-5 h-5 text-destructive" />,
		loading: <LoaderPinwheel className="w-5 h-5 text-info animate-spin" />,
		feedback: <MessageCircleReply className="w-5 h-5 text-destructive" />,
	}

	if (!approvalState) {
		return null
	}

	return (
		<div
			className={cn(
				"border-l-4 p-3 bg-card text-card-foreground",
				{
					"border-primary": variant === "primary",
					"border-secondary": variant === "info",
					"border-accent": variant === "accent",
					"border-success": variant === "success",
					"border-info": variant === "info",
					"border-muted": variant === "default",
					"border-destructive": variant === "destructive",
				},
				isSubMsg && "!-mt-5"
			)}>
			<div className="flex items-center justify-between mb-2">
				<div className="flex items-center">
					<Icon className={cn("w-5 h-5 mr-2", `text-${variant}`)} />
					<h3 className="text-sm font-semibold">{title}</h3>
				</div>

				{userFeedback ? (
					<Tooltip>
						<TooltipTrigger>{stateIcons["feedback"]}</TooltipTrigger>
						<TooltipContent side="left">The tool got rejected with feedback</TooltipContent>
					</Tooltip>
				) : (
					stateIcons[approvalState]
				)}
			</div>
			<div className="text-sm">{children}</div>
		</div>
	)
}

export const DevServerToolBlock: React.FC<ServerRunnerTool & ToolAddons> = ({
	commandType,
	commandToRun,
	approvalState,
	onApprove,
	onReject,
	tool,
	serverName,
	ts,
	output,
	...rest
}) => {
	const [isOpen, setIsOpen] = useState(false)

	const getIcon = () => {
		switch (commandType) {
			case "start":
				return Play
			case "stop":
				return Square
			case "restart":
				return RefreshCw
			case "getLogs":
				return FileText
			default:
				return Server
		}
	}

	const Icon = getIcon()

	return (
		<ToolBlock
			{...rest}
			ts={ts}
			tool={tool}
			icon={Icon}
			// title={`Dev Server - ${commandType?.charAt(0)?.toUpperCase?.() + commandType?.slice?.(1)}`}
			title={`Dev Server - ${serverName}`}
			variant="primary"
			approvalState={approvalState}
			onApprove={onApprove}
			onReject={onReject}>
			<div className="bg-muted p-2 rounded font-mono text-xs overflow-x-auto">
				<span className="text-success">$</span> {commandToRun}
			</div>

			{approvalState === "loading" && (
				<div className="mt-2 flex items-center">
					<span className="text-xs mr-2">
						Server is {commandType === "stop" ? "stopping" : "starting"}...
					</span>
					<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
				</div>
			)}

			{output && (
				<Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="flex items-center w-full justify-between">
							<span>View Output</span>
							{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<ScrollArea className="h-[200px] w-full rounded-md border">
							<ScrollArea className="h-[200px] w-full rounded-md border">
								<div className="p-4">
									<pre className="text-sm whitespace-pre-wrap text-pretty break-all">{output}</pre>
								</div>{" "}
								<ScrollBar orientation="vertical" />
							</ScrollArea>

							<ScrollBar orientation="vertical" />
						</ScrollArea>
					</CollapsibleContent>
				</Collapsible>
			)}

			{approvalState === "approved" && commandType === "start" && (
				<p className="text-xs mt-2 text-success">Server started successfully.</p>
			)}

			{approvalState === "approved" && commandType === "stop" && (
				<p className="text-xs mt-2 text-success">Server stopped successfully.</p>
			)}
			{approvalState === "approved" && commandType === "restart" && (
				<p className="text-xs mt-2 text-success">Server restarted successfully.</p>
			)}
			{approvalState === "approved" && commandType === "getLogs" && (
				<p className="text-xs mt-2 text-success">Server logs retrieved successfully.</p>
			)}

			{approvalState === "error" && (
				<p className="text-xs mt-2 text-destructive">An error occurred while {commandType}ing the server.</p>
			)}
		</ToolBlock>
	)
}
export const ChatTruncatedBlock = ({ ts, text }: { ts: number; text?: string }) => {
	let before: number | undefined
	let after: number | undefined

	try {
		const parsed = JSON.parse(text ?? "{}")
		before = parsed.before
		after = parsed.after
	} catch {
		// Do nothing
	}

	const tokensSaved = before && after ? before - after : undefined
	const reductionPercent = before && after ? Math.round((tokensSaved! / before) * 100) : undefined

	return (
		<ToolBlock
			ts={ts}
			tool="write_to_file"
			icon={Scissors}
			title="Chat Compressed"
			variant="info"
			approvalState="approved"
			isSubMsg={false}>
			<div className="space-y-4">
				<div className="bg-secondary/20 p-3 rounded-md">
					<p className="text-sm">
						The conversation history was compressed before reaching the maximum context window. Previous
						content may be unavailable, but the task can continue.
					</p>
				</div>

				{before && after && (
					<div className="space-y-3">
						<div className="flex items-center justify-between text-sm">
							<div className="flex items-center gap-2">
								<span className="font-medium">Tokens</span>
								<span className="text-muted-foreground">
									{before.toLocaleString()} → {after.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="font-medium">Saved</span>
								<span className="text-success">
									{tokensSaved?.toLocaleString()} ({reductionPercent}%)
								</span>
							</div>
						</div>
					</div>
				)}
			</div>
		</ToolBlock>
	)
}

export const ChatMaxWindowBlock = ({ ts }: { ts: number }) => (
	<ToolBlock
		icon={AlertCircle}
		title="Maximum Context Reached"
		variant="destructive"
		approvalState="approved"
		isSubMsg={false}
		ts={ts}
		tool="write_to_file">
		<div className="bg-destructive/20 p-3 rounded-md">
			<p className="text-sm font-medium">This task has reached its maximum context limit and cannot continue.</p>
			<p className="text-sm mt-2">Please start a new task to continue working. Your progress has been saved.</p>
		</div>
	</ToolBlock>
)

export const ExecuteCommandBlock: React.FC<
	ExecuteCommandTool &
		ToolAddons & {
			hasNextMessage?: boolean
		}
> = ({ command, output, approvalState, onApprove, tool, ts, onReject, ...rest }) => {
	const [isOpen, setIsOpen] = React.useState(false)

	return (
		<ToolBlock
			{...rest}
			ts={ts}
			tool={tool}
			icon={Terminal}
			title="Execute Command"
			variant="info"
			approvalState={approvalState}
			onApprove={onApprove}
			onReject={onReject}>
			<div className="bg-muted p-2 rounded font-mono text-xs overflow-x-auto">
				<span className="text-success">$</span> {command}
			</div>

			{/* {approvalState === "loading" && earlyExit === "pending" && (
				<>
					<div className="flex justify-end space-x-1 mt-2">
						<Button variant="outline" size="sm" onClick={onApprove}>
							Continue while running
						</Button>
					</div>
				</>
			)} */}
			{output && (
				<Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="flex items-center w-full justify-between">
							<span>View Output</span>
							{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<ScrollArea className="h-[200px] w-full rounded-md border">
							<div className="bg-secondary/20 p-3 rounded-md text-sm">
								<pre className="whitespace-pre-wrap text-pretty break-all">{output}</pre>
							</div>
							<ScrollBar orientation="vertical" />
						</ScrollArea>
					</CollapsibleContent>
				</Collapsible>
			)}
		</ToolBlock>
	)
}

export const ListFilesBlock: React.FC<ListFilesTool & ToolAddons> = ({
	path,
	recursive,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={FolderTree}
		title="List Files"
		variant="info"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<p className="text-xs">
			<span className="font-semibold">Folder:</span> {path}
		</p>
		<p className="text-xs">
			<span className="font-semibold">Include subfolders:</span> {recursive || "No"}
		</p>
	</ToolBlock>
)

export const ListCodeDefinitionNamesBlock: React.FC<ListCodeDefinitionNamesTool & ToolAddons> = ({
	path,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={Code}
		title="List Code Definitions"
		variant="accent"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<p className="text-xs">
			<span className="font-semibold">Scanning folder:</span> {path}
		</p>
	</ToolBlock>
)

export const SearchFilesBlock: React.FC<SearchFilesTool & ToolAddons> = ({
	path,
	regex,
	filePattern,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={Search}
		title="Search Files"
		variant="info"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<p className="text-xs">
			<span className="font-semibold">Search in:</span> {path}
		</p>
		<p className="text-xs">
			<span className="font-semibold">Look for:</span> {regex}
		</p>
		{filePattern && (
			<p className="text-xs">
				<span className="font-semibold">File types:</span> {filePattern}
			</p>
		)}
	</ToolBlock>
)

export const ReadFileBlock: React.FC<ReadFileTool & ToolAddons> = ({
	path,
	approvalState,
	onApprove,
	content,
	onReject,
	tool,
	ts,
	...rest
}) => {
	const [isOpen, setIsOpen] = React.useState(false)

	return (
		<ToolBlock
			{...rest}
			ts={ts}
			tool={tool}
			icon={FileText}
			title="Read File"
			variant="primary"
			approvalState={approvalState}
			onApprove={onApprove}
			onReject={onReject}>
			<p className="text-xs">
				<span className="font-semibold">File:</span> {path}
			</p>
			{content && content.length > 0 && (
				<Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-2">
					<CollapsibleTrigger asChild>
						<Button variant="ghost" size="sm" className="flex items-center w-full justify-between">
							<span>View Output</span>
							{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
					</CollapsibleTrigger>
					<CollapsibleContent className="mt-2">
						<ScrollArea className="h-[200px] w-full rounded-md border">
							<div className="bg-secondary/20 p-3 rounded-md text-sm">
								<pre className="whitespace-pre-wrap">{content}</pre>
							</div>
							<ScrollBar orientation="vertical" />
							<ScrollBar orientation="horizontal" />
						</ScrollArea>
					</CollapsibleContent>
				</Collapsible>
			)}
		</ToolBlock>
	)
}

export type ToolStatus = "pending" | "rejected" | "approved" | "error" | "loading" | undefined

const CHUNK_SIZE = 50

const textVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
}

export const WriteToFileBlock: React.FC<WriteToFileTool & ToolAddons> = memo(
	({ path, content, approvalState, onApprove, onReject, tool, ts, ...rest }) => {
		content = content ?? ""
		const [visibleContent, setVisibleContent] = useState<string[]>([])
		const [totalLines, setTotalLines] = useState(0)
		const isStreaming = approvalState === "loading"
		const scrollAreaRef = useRef<HTMLDivElement>(null)
		const lastChunkRef = useRef<HTMLPreElement>(null)
		const animationCompleteCountRef = useRef(0)

		useEffect(() => {
			const text = content ?? ""
			setTotalLines(text.split("\n").length)

			if (isStreaming) {
				const chunks = text.match(new RegExp(`.{1,${CHUNK_SIZE * 2}}`, "g")) || []
				setVisibleContent(chunks)
			} else {
				setVisibleContent([text])
			}

			// Reset the animation complete count when content changes
			animationCompleteCountRef.current = 0
		}, [content, isStreaming])

		return (
			<ToolBlock
				{...rest}
				ts={ts}
				tool={tool}
				icon={Edit}
				title="Write to File"
				variant="info"
				approvalState={approvalState}
				onApprove={onApprove}
				onReject={onReject}>
				<p className="text-xs mb-1">
					<span className="font-semibold">File:</span> {path}
				</p>
				<ScrollArea viewProps={{ ref: scrollAreaRef }} className="h-24 rounded border bg-background p-2">
					<ScrollBar orientation="vertical" />
					<ScrollBar orientation="horizontal" />
					<div className="relative">
						{isStreaming && (
							<motion.div
								className="sticky left-0 top-0 w-full h-1 bg-primary"
								initial={{ scaleX: 0 }}
								animate={{ scaleX: 1 }}
								transition={{
									repeat: Infinity,
									duration: 2,
									ease: "linear",
								}}
							/>
						)}
						{!isStreaming ? (
							<pre className="font-mono text-xs text-white whitespace-pre-wrap overflow-hidden">
								{content?.trim() ?? ""}
							</pre>
						) : (
							<AnimatePresence>
								{visibleContent.map((chunk, index) => (
									<motion.pre
										key={index}
										ref={index === visibleContent.length - 1 ? lastChunkRef : null}
										variants={textVariants}
										initial="hidden"
										animate="visible"
										transition={{ duration: 0.3, delay: index * 0.03 }}
										className="font-mono text-xs text-white whitespace-pre-wrap overflow-hidden">
										{index === 0 ? chunk.trim() : chunk}
									</motion.pre>
								))}
							</AnimatePresence>
						)}
					</div>
				</ScrollArea>
				<div className="mt-2 flex justify-between items-center">
					<span className="text-xs text-muted-foreground">
						{isStreaming ? "Streaming..." : `Completed: ${totalLines} lines written`}
					</span>
				</div>
			</ToolBlock>
		)
	},
	(prevProps, nextProps) => {
		return (
			prevProps.approvalState === nextProps.approvalState &&
			prevProps.content === nextProps.content &&
			prevProps.ts === nextProps.ts &&
			prevProps.path === nextProps.path
		)
	}
)
export const AskFollowupQuestionBlock: React.FC<AskFollowupQuestionTool & ToolAddons> = ({
	question,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={HelpCircle}
		title="Follow-up Question"
		variant="info"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<div className="bg-info/20 text-info-foreground p-2 rounded text-xs">{question}</div>
	</ToolBlock>
)

export const AttemptCompletionBlock: React.FC<AttemptCompletionTool & ToolAddons> = ({
	result,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={CheckCircle}
		title="Task Completion"
		variant="success"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		{/* {command && (
			<div className="bg-muted p-2 rounded font-mono text-xs overflow-x-auto mb-2">
				<span className="text-success">$</span> {command}
			</div>
		)} */}
		<div className="bg-success/20 text-success-foreground p-2 rounded text-xs w-full flex">
			<pre className="whitespace-pre text-wrap">{result?.trim()}</pre>
		</div>
	</ToolBlock>
)

export const UrlScreenshotBlock: React.FC<UrlScreenshotTool & ToolAddons> = ({
	url,
	approvalState,
	onApprove,
	onReject,
	tool,
	base64Image,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={Image}
		title="URL Screenshot"
		variant="accent"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<p className="text-xs">
			<span className="font-semibold">Website:</span> {url}
		</p>
		{base64Image && (
			<div className="bg-muted rounded-md mt-2 text-xs w-full max-h-40 overflow-auto">
				<img src={`data:image/png;base64,${base64Image}`} alt="URL Screenshot" />
			</div>
		)}
	</ToolBlock>
)

export const AskConsultantBlock: React.FC<AskConsultantTool & ToolAddons> = ({
	query,
	approvalState,
	onApprove,
	onReject,
	tool,
	ts,
	...rest
}) => (
	<ToolBlock
		{...rest}
		ts={ts}
		tool={tool}
		icon={MessageCircle}
		title="Ask Consultant"
		variant="primary"
		approvalState={approvalState}
		onApprove={onApprove}
		onReject={onReject}>
		<div className="bg-primary/20 text-primary-foreground p-2 rounded text-xs">{query}</div>
	</ToolBlock>
)

export const ToolContentBlock: React.FC<{
	tool: ChatTool & {
		onApprove?: () => void
		onReject?: (feedback: string) => void
	}
	hasNextMessage?: boolean
}> = ({ tool }) => {
	tool.onApprove = () => {
		vscode.postMessage({
			feedback: "approve",
			toolId: tool.ts,
			type: "toolFeedback",
		})
	}
	tool.onReject = (feedback: string) => {
		vscode.postMessage({
			feedback: "reject",
			toolId: tool.ts,
			feedbackMessage: feedback,
			type: "toolFeedback",
		})
	}
	switch (tool.tool) {
		case "execute_command":
			return <ExecuteCommandBlock hasNextMessage {...tool} />
		case "list_files":
			return <ListFilesBlock {...tool} />
		case "list_code_definition_names":
			return <ListCodeDefinitionNamesBlock {...tool} />
		case "search_files":
			return <SearchFilesBlock {...tool} />
		case "read_file":
			return <ReadFileBlock {...tool} />
		case "write_to_file":
			return <WriteToFileBlock {...tool} />
		case "ask_followup_question":
			return <AskFollowupQuestionBlock {...tool} approvalState="pending" />
		case "attempt_completion":
			return <AttemptCompletionBlock {...tool} />
		case "web_search":
			return <EnhancedWebSearchBlock {...tool} />
		case "url_screenshot":
			return <UrlScreenshotBlock {...tool} />
		case "ask_consultant":
			return <AskConsultantBlock {...tool} />

		case "server_runner_tool":
			return <DevServerToolBlock {...tool} />
		default:
			return null
	}
}
