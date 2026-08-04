'use client';

import { useState, useActionState, useEffect, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Upload, 
  Loader2, 
  BookOpen, 
  PlusCircle, 
  Layers, 
  Edit3, 
  Trash2, 
  Save, 
  X,
  ChevronRight,
  FolderTree,
  FolderPlus,
  GripVertical,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  FileEdit
} from 'lucide-react';
import { 
  createProjectAction, 
  updateProjectAction,
  appendChapterAction, 
  updateChapterAction, 
  deleteChapterAction, 
  renameActAction, 
  createActAction,
  deleteActAction,
  reorderStructureAction,
  type ActionResponse 
} from '../actions/project.actions';
import { MarkdownEditorWithPreview } from '@/features/document-reader/components/MarkdownEngine/MarkdownEditorWithPreview';
import { GalleryUrlsEditor } from './GalleryUrlsEditor';
import { DownloadLinksEditor } from './DownloadLinksEditor';
import { 
  parseStoryChapters, 
  serializeStoryChapters, 
  type ParsedChapter 
} from '@/features/document-reader/components/MarkdownEngine/MarkdownParser';

const initialState: ActionResponse = {
  error: null,
};

export interface ExistingProjectOption {
  id: string;
  title: string;
  description?: string;
  category: string;
  status?: string;
  image_url?: string | null;
  file_type?: 'pdf' | 'markdown' | null;
  document_url?: string | null;
  markdown_content?: string | null;
  video_url?: string | null;
  audio_url?: string | null;
  gallery_urls?: string[] | null;
  download_links?: { label: string; url: string }[] | null;
}

interface ActGroup {
  actName: string | null;
  items: Array<{ chap: ParsedChapter; index: number }>;
  isEmpty?: boolean;
}

interface DraggedChapterInfo {
  fromGroupIdx: number;
  itemIdx: number;
  chap: ParsedChapter;
}

export function ProjectForm({ projects = [] }: { projects?: ExistingProjectOption[] }) {
  const searchParams = useSearchParams();
  const urlProjectId = searchParams.get('project_id');
  const urlMode = searchParams.get('mode');

  const [formMode, setFormMode] = useState<'create_work' | 'edit_work' | 'append_chapter' | 'manage_studio'>('create_work');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isPendingTransition, startTransition] = useTransition();
  
  // Server Actions
  const [createState, createAction, isCreatePending] = useActionState(createProjectAction, initialState);
  const [updateProjectState, updateProjectFormAction, isUpdateProjectPending] = useActionState(updateProjectAction, initialState);
  const [appendState, appendAction, isAppendPending] = useActionState(appendChapterAction, initialState);
  const [updateState, updateAction, isUpdatePending] = useActionState(updateChapterAction, initialState);
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteChapterAction, initialState);
  const [renameActState, renameActFormAction, isRenameActPending] = useActionState(renameActAction, initialState);
  const [createActState, createActFormAction, isCreateActPending] = useActionState(createActAction, initialState);
  const [deleteActState, deleteActFormAction, isDeleteActPending] = useActionState(deleteActAction, initialState);
  const [reorderState, reorderFormAction, isReorderPending] = useActionState(reorderStructureAction, initialState);

  // Form States for Creating
  const [preview, setPreview] = useState<string | null>(null);
  const [docType, setDocType] = useState<'none' | 'pdf' | 'markdown'>('none');
  const [selectedAct, setSelectedAct] = useState<string>('');
  const [createGalleryUrls, setCreateGalleryUrls] = useState<string>('');
  const [createDownloadLinks, setCreateDownloadLinks] = useState<string>('');

  // Form States for Editing Existing Work
  const [editTitle, setEditTitle] = useState<string>('');
  const [editCategory, setEditCategory] = useState<string>('apps-software');
  const [editStatus, setEditStatus] = useState<string>('En Emisión');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editDocType, setEditDocType] = useState<'none' | 'pdf' | 'markdown'>('none');
  const [editVideoUrl, setEditVideoUrl] = useState<string>('');
  const [editAudioUrl, setEditAudioUrl] = useState<string>('');
  const [editGalleryUrls, setEditGalleryUrls] = useState<string>('');
  const [editDownloadLinks, setEditDownloadLinks] = useState<string>('');
  const [editMarkdownContent, setEditMarkdownContent] = useState<string>('');

  // Chapter Editing States inside CMS Studio
  const [editingChapterIndex, setEditingChapterIndex] = useState<number | null>(null);
  const [editingChapterTitle, setEditingChapterTitle] = useState<string>('');
  const [editingChapterActSelect, setEditingChapterActSelect] = useState<string>('');
  const [editingChapterCustomAct, setEditingChapterCustomAct] = useState<string>('');
  const [editingChapterContent, setEditingChapterContent] = useState<string>('');
  
  // Act Management States
  const [showCreateActModal, setShowCreateActModal] = useState<boolean>(false);
  const [newEmptyActName, setNewEmptyActName] = useState<string>('');
  const [renamingActName, setRenamingActName] = useState<string | null>(null);
  const [newActName, setNewActName] = useState<string>('');

  // Drag & Drop States
  const [actGroupsState, setActGroupsState] = useState<ActGroup[]>([]);
  const [draggedGroupIndex, setDraggedGroupIndex] = useState<number | null>(null);
  const [draggedChapter, setDraggedChapter] = useState<DraggedChapterInfo | null>(null);
  const [dragOverGroupIdx, setDragOverGroupIdx] = useState<number | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | null>(null);

  const currentProject = projects.find((p) => p.id === selectedProjectId);
  const parsedStory = currentProject?.markdown_content ? parseStoryChapters(currentProject.markdown_content) : null;
  const chapters: ParsedChapter[] = parsedStory?.chapters || [];
  const emptyActs: string[] = parsedStory?.emptyActs || [];

  // Auto-detect project_id and mode from URL searchParams
  useEffect(() => {
    if (urlProjectId) {
      setSelectedProjectId(urlProjectId);
      if (urlMode === 'edit') {
        setFormMode('edit_work');
      } else if (urlMode === 'studio') {
        setFormMode('manage_studio');
      } else {
        setFormMode('edit_work');
      }
    }
  }, [urlProjectId, urlMode]);

  // Pre-populate Edit Work Form when selected project changes
  useEffect(() => {
    if (currentProject) {
      setEditTitle(currentProject.title || '');
      setEditCategory(currentProject.category || 'apps-software');
      setEditStatus(currentProject.status || 'En Emisión');
      setEditDescription(currentProject.description || '');
      setEditDocType(
        currentProject.file_type === 'pdf'
          ? 'pdf'
          : currentProject.file_type === 'markdown'
          ? 'markdown'
          : 'none'
      );
      setEditVideoUrl(currentProject.video_url || '');
      setEditAudioUrl(currentProject.audio_url || '');
      setEditGalleryUrls(currentProject.gallery_urls ? currentProject.gallery_urls.join('\n') : '');
      setEditDownloadLinks(currentProject.download_links ? JSON.stringify(currentProject.download_links) : '');
      setEditMarkdownContent(currentProject.markdown_content || '');
      setPreview(currentProject.image_url || null);
    }
  }, [selectedProjectId, currentProject]);

  // Extract unique Acts/Seasons from the selected project (both filled and empty)
  const existingActs = Array.from(
    new Set([
      ...chapters.map((c) => c.actOrSeason).filter((a): a is string => Boolean(a)),
      ...emptyActs,
    ])
  );

  // Sync actGroupsState when selected project changes or markdown updates
  useEffect(() => {
    if (!currentProject?.markdown_content) {
      setActGroupsState([]);
      return;
    }

    const parsed = parseStoryChapters(currentProject.markdown_content);
    const groups: ActGroup[] = [];

    parsed.chapters.forEach((chap, idx) => {
      const actName = chap.actOrSeason || null;
      let group = groups.find((g) => g.actName === actName);
      if (!group) {
        group = { actName, items: [], isEmpty: false };
        groups.push(group);
      }
      group.items.push({ chap, index: idx });
    });

    for (const emptyAct of parsed.emptyActs) {
      if (!groups.some((g) => g.actName === emptyAct)) {
        groups.push({
          actName: emptyAct,
          items: [],
          isEmpty: true,
        });
      }
    }

    setActGroupsState(groups);
  }, [selectedProjectId, currentProject?.markdown_content]);

  // Helper function to find the REAL dynamic global index of a chapter
  const getRealChapterIndex = (targetChap: ParsedChapter): number => {
    if (!parsedStory) return -1;
    return parsedStory.chapters.findIndex(
      (c) => c.title === targetChap.title && (c.actOrSeason || '') === (targetChap.actOrSeason || '')
    );
  };

  // Helper function to auto-save the updated structure immediately to Supabase
  const triggerAutoSaveStructure = (updatedGroups: ActGroup[]) => {
    if (!parsedStory || !selectedProjectId) return;

    setAutoSaveStatus('saving');

    const reorderedChapters: ParsedChapter[] = [];
    const reorderedEmptyActs: string[] = [];

    for (const group of updatedGroups) {
      if (group.isEmpty && group.actName) {
        reorderedEmptyActs.push(group.actName);
      } else {
        for (const item of group.items) {
          reorderedChapters.push({
            ...item.chap,
            actOrSeason: group.actName || undefined,
          });
        }
      }
    }

    const serialized = serializeStoryChapters(parsedStory.frontmatter, reorderedChapters, reorderedEmptyActs);

    const fd = new FormData();
    fd.append('target_project_id', selectedProjectId);
    fd.append('reordered_markdown', serialized);

    startTransition(() => {
      reorderFormAction(fd);
      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(null), 3000);
    });
  };

  // Reorder Groups (Seasons)
  const moveGroup = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= actGroupsState.length) return;
    const updated = [...actGroupsState];
    const [moved] = updated.splice(fromIdx, 1);
    updated.splice(toIdx, 0, moved);
    setActGroupsState(updated);
    triggerAutoSaveStructure(updated);
  };

  // Reorder Chapters inside a Group
  const moveChapterInGroup = (groupIdx: number, fromChapIdx: number, toChapIdx: number) => {
    const updatedGroups = [...actGroupsState];
    const groupItems = updatedGroups[groupIdx].items;
    if (toChapIdx < 0 || toChapIdx >= groupItems.length) return;

    const [moved] = groupItems.splice(fromChapIdx, 1);
    groupItems.splice(toChapIdx, 0, moved);
    setActGroupsState(updatedGroups);
    triggerAutoSaveStructure(updatedGroups);
  };

  // Drag & Drop Handler when dropping onto a Season Container
  const handleContainerDrop = (targetGroupIdx: number) => {
    setDragOverGroupIdx(null);

    // Scenario A: Dragging a chapter into a season container
    if (draggedChapter) {
      const { fromGroupIdx, itemIdx } = draggedChapter;
      const updated = [...actGroupsState];
      const sourceGroup = updated[fromGroupIdx];
      const targetGroup = updated[targetGroupIdx];

      // Remove chapter from source group
      const [movedItem] = sourceGroup.items.splice(itemIdx, 1);

      // Assign chapter to target season name
      const targetActName = targetGroup.actName || undefined;
      movedItem.chap = {
        ...movedItem.chap,
        actOrSeason: targetActName,
      };

      // Push into target container
      targetGroup.items.push(movedItem);
      targetGroup.isEmpty = false;

      // Mark source group empty if no chapters left
      if (sourceGroup.actName && sourceGroup.items.length === 0) {
        sourceGroup.isEmpty = true;
      }

      setActGroupsState(updated);
      setDraggedChapter(null);
      triggerAutoSaveStructure(updated);
      return;
    }

    // Scenario B: Dragging a season container over another season container
    if (draggedGroupIndex !== null && draggedGroupIndex !== targetGroupIdx) {
      moveGroup(draggedGroupIndex, targetGroupIdx);
      setDraggedGroupIndex(null);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const startEditingChapter = (chap: ParsedChapter) => {
    const realIndex = getRealChapterIndex(chap);
    setEditingChapterIndex(realIndex >= 0 ? realIndex : 0);
    setEditingChapterTitle(chap.title);
    
    const currentAct = chap.actOrSeason || '';
    if (currentAct && existingActs.includes(currentAct)) {
      setEditingChapterActSelect(currentAct);
      setEditingChapterCustomAct('');
    } else if (currentAct) {
      setEditingChapterActSelect('__new__');
      setEditingChapterCustomAct(currentAct);
    } else {
      setEditingChapterActSelect('');
      setEditingChapterCustomAct('');
    }
    
    let contentText = '';
    for (const b of chap.blocks) {
      if (b.type === 'paragraph') contentText += `${b.content}\n\n`;
      else if (b.type === 'heading') contentText += `${'#'.repeat(b.level || 2)} ${b.content}\n\n`;
      else if (b.type === 'callout') contentText += `> [!${b.calloutType || 'note'}] ${b.calloutTitle || ''}\n${b.content}\n\n`;
      else if (b.type === 'speech') {
        let attrs = `speaker="${b.speaker || 'Personaje'}"`;
        if (b.avatar && b.avatar.trim()) attrs += ` avatar="${b.avatar.trim()}"`;
        if (b.side && b.side !== 'left') attrs += ` side="${b.side}"`;
        if (b.color && b.color.trim()) attrs += ` color="${b.color.trim()}"`;
        contentText += `<speech ${attrs}>\n${b.content}\n</speech>\n\n`;
      }
      else if (b.type === 'cyoa_choice') contentText += `- [ ] [${b.content}](#${b.id || ''})\n\n`;
    }
    setEditingChapterContent(contentText.trim());
  };

  const currentState = 
    formMode === 'create_work' 
      ? createState 
      : formMode === 'edit_work'
      ? updateProjectState
      : formMode === 'append_chapter' 
      ? appendState 
      : updateState || deleteState || renameActState || createActState || deleteActState || reorderState;

  const isPending = 
    isCreatePending || isUpdateProjectPending || isAppendPending || isUpdatePending || isDeletePending || isRenameActPending || isCreateActPending || isDeleteActPending || isReorderPending || isPendingTransition;

  return (
    <div className="w-full bg-[#160E0A] border border-white/15 rounded-2xl p-6 md:p-10 shadow-2xl font-mono">
      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-8 border-b border-white/15 pb-6">
        <button
          type="button"
          onClick={() => setFormMode('create_work')}
          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'create_work'
              ? 'bg-[#8B2FE0] text-white border-[#C084FC] shadow-xl'
              : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>1. CREAR NUEVA OBRA</span>
        </button>

        <button
          type="button"
          onClick={() => setFormMode('edit_work')}
          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'edit_work'
              ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957] shadow-xl'
              : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>2. EDITAR OBRA EXISTENTE</span>
        </button>

        <button
          type="button"
          onClick={() => setFormMode('append_chapter')}
          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'append_chapter'
              ? 'bg-[#8B2FE0] text-white border-[#C084FC] shadow-xl'
              : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#C084FC]" />
          <span>3. AÑADIR CAPÍTULO</span>
        </button>

        <button
          type="button"
          onClick={() => setFormMode('manage_studio')}
          className={`px-4 py-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            formMode === 'manage_studio'
              ? 'bg-[#8B2FE0] text-white border-[#C084FC] shadow-xl'
              : 'bg-black/60 text-[#F2EDE4]/60 border-white/10 hover:border-white/30'
          }`}
        >
          <FolderTree className="w-4 h-4 text-[#7ED957]" />
          <span>4. CMS ESTRUCTURA</span>
        </button>
      </div>

      {currentState?.error && (
        <div className="mb-6 p-4 bg-[#7A1220]/30 border border-[#7A1220] rounded-xl text-[#F2EDE4] text-xs font-bold flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#7A1220] animate-ping" />
          {currentState.error}
        </div>
      )}

      {/* MODE 1: CREATE NEW WORK */}
      {formMode === 'create_work' && (
        <form action={createAction} className="flex flex-col gap-6">
          <div>
            <label className="block mb-2 text-xs font-bold text-white uppercase tracking-wider">
              Imagen de Portada / Miniatura <span className="text-[#8B2FE0]">*</span>
            </label>
            <div className="relative w-full h-60 bg-black/60 border-2 border-dashed border-white/20 rounded-xl hover:border-[#8B2FE0] transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {preview ? (
                <>
                  <Image
                    src={preview}
                    alt="Vista previa"
                    fill
                    className="object-cover opacity-75 group-hover:opacity-40 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="bg-black/90 text-white text-xs px-4 py-2 rounded-lg border border-white/20 font-bold flex items-center gap-2">
                      <Upload className="w-4 h-4" /> CAMBIAR PORTADA
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center pointer-events-none p-4 text-center">
                  <div className="w-14 h-14 bg-[#8B2FE0]/20 rounded-full flex items-center justify-center mb-3 text-[#C084FC] border border-[#8B2FE0]/40 group-hover:scale-110 transition-all">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-white text-xs font-bold uppercase tracking-wider mb-1">
                    Arrastra o haz clic para subir la portada
                  </span>
                  <span className="text-[10px] text-[#F2EDE4]/60">
                    Formatos soportados: JPG, PNG, WebP (Máx. 5MB)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                Título de la Obra <span className="text-[#8B2FE0]">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none text-xs font-mono"
                placeholder="Ej: SomaCore App, Umbral, The Pale Veil"
              />
            </div>

            <div>
              <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                Categoría ESTRATO <span className="text-[#8B2FE0]">*</span>
              </label>
              <select
                name="category"
                defaultValue="apps-software"
                className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
              >
                <option value="apps-software" className="bg-[#0D0A08]">Apps &amp; BioTech</option>
                <option value="animaciones" className="bg-[#0D0A08]">Animaciones</option>
                <option value="visual-novel" className="bg-[#0D0A08]">Visual Novels</option>
                <option value="games" className="bg-[#0D0A08]">Games</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Estado de Publicación <span className="text-[#8B2FE0]">*</span>
            </label>
            <select
              name="status"
              defaultValue="En Emisión"
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
            >
              <option value="En Emisión" className="bg-[#0D0A08]">🟢 En Emisión</option>
              <option value="Pausado" className="bg-[#0D0A08]">🟡 Pausado</option>
              <option value="Finalizado" className="bg-[#0D0A08]">🔴 Finalizado</option>
            </select>
          </div>

          <div className="p-5 bg-black/40 border border-white/15 rounded-xl">
            <label className="block mb-3 text-xs font-bold text-white uppercase tracking-wider">
              📄 Formato Principal de Lectura de Documento
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <button
                type="button"
                onClick={() => setDocType('none')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  docType === 'none'
                    ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                    : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                }`}
              >
                🚫 Sin Documento
              </button>
              <button
                type="button"
                onClick={() => setDocType('pdf')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  docType === 'pdf'
                    ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                    : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                }`}
              >
                📄 Documento PDF
              </button>
              <button
                type="button"
                onClick={() => setDocType('markdown')}
                className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  docType === 'markdown'
                    ? 'bg-[#8B2FE0] text-white border-[#8B2FE0]'
                    : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                }`}
              >
                📖 Markdown (Obsidian)
              </button>
            </div>

            <input type="hidden" name="file_type" value={docType === 'none' ? '' : docType} />

            {docType === 'pdf' && (
              <div className="pt-2">
                <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                  Adjuntar Archivo PDF (.pdf)
                </label>
                <input
                  type="file"
                  name="doc_file"
                  accept=".pdf,application/pdf"
                  className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
                />
              </div>
            )}

            {docType === 'markdown' && (
              <div className="flex flex-col gap-4 pt-2">
                <div>
                  <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                    Opción A: Adjuntar Archivo Markdown (.md)
                  </label>
                  <input
                    type="file"
                    name="doc_file"
                    accept=".md,.markdown,text/markdown"
                    className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
                    Opción B: Redactar con Editor Interactivo &amp; Vista Previa (Sistema ESTRATO)
                  </label>
                  <MarkdownEditorWithPreview name="markdown_content" />
                </div>
              </div>
            )}
          </div>

          {/* Multi-Media Extensions Section */}
          <div className="p-5 bg-black/40 border border-[#FFD700]/30 rounded-xl space-y-4">
            <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider block">
              🎬 MULTIMEDIA ADICIONAL NO EXCLUYENTE (OPCIONAL)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                  🎬 URL de Video (YouTube / TikTok / Drive / MP4)
                </label>
                <input
                  type="url"
                  name="video_url"
                  placeholder="https://www.youtube.com/watch?v=... o TikTok / Drive"
                  className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
                />
              </div>

              <div>
                <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                  🎵 URL de Audio / Soundtrack BGM (MP3 / WAV)
                </label>
                <input
                  type="url"
                  name="audio_url"
                  placeholder="https://ejemplo.com/soundtrack.mp3"
                  className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                🖼️ Galería de Ilustraciones (una fila por imagen, con vista previa)
              </label>
              <GalleryUrlsEditor
                name="gallery_urls"
                value={createGalleryUrls}
                onChange={setCreateGalleryUrls}
                accentColor="#8B2FE0"
              />
            </div>

            <div>
              <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                ⬇️ Enlaces de Descarga Externos (ej. Google Drive)
              </label>
              <DownloadLinksEditor
                name="download_links"
                value={createDownloadLinks}
                onChange={setCreateDownloadLinks}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Sinopsis / Resumen Técnico <span className="text-[#8B2FE0]">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              required
              placeholder="Describe el concepto, sinopsis o ficha técnica de la obra..."
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#8B2FE0] focus:outline-none resize-none text-xs leading-relaxed font-sans"
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'REGISTRAR OBRA EN CATÁLOGO →'}
            </button>
          </div>
        </form>
      )}

      {/* MODE 2: EDIT EXISTING WORK */}
      {formMode === 'edit_work' && (
        <form action={updateProjectFormAction} className="flex flex-col gap-6">
          <div className="p-4 bg-[#7ED957]/15 border border-[#7ED957]/40 rounded-xl text-xs text-[#7ED957] leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 mb-1">
              <FileEdit className="w-4 h-4" /> EDITANDO OBRA REGISTRADA
            </span>
            Modifica la información, imagen de portada, documento PDF o manuscrito Markdown de la obra seleccionada.
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Seleccionar Obra a Modificar <span className="text-[#8B2FE0]">*</span>
            </label>
            <select
              name="target_project_id"
              required
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
            >
              <option value="">-- SELECCIONAR OBRA REGISTRADA --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0D0A08]">
                  [{p.category.toUpperCase()}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {selectedProjectId && (
            <>
              <div>
                <label className="block mb-2 text-xs font-bold text-white uppercase tracking-wider">
                  Imagen de Portada / Miniatura (Dejar vacío para mantener la actual)
                </label>
                <div className="relative w-full h-60 bg-black/60 border-2 border-dashed border-white/20 rounded-xl hover:border-[#7ED957] transition-all flex flex-col items-center justify-center overflow-hidden cursor-pointer group">
                  <input
                    type="file"
                    name="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {preview ? (
                    <>
                      <Image
                        src={preview}
                        alt="Portada actual"
                        fill
                        className="object-cover opacity-75 group-hover:opacity-40 transition-opacity"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <span className="bg-black/90 text-white text-xs px-4 py-2 rounded-lg border border-white/20 font-bold flex items-center gap-2">
                          <Upload className="w-4 h-4" /> CAMBIAR PORTADA
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center pointer-events-none p-4 text-center">
                      <div className="w-14 h-14 bg-[#7ED957]/20 rounded-full flex items-center justify-center mb-3 text-[#7ED957] border border-[#7ED957]/40 group-hover:scale-110 transition-all">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-white text-xs font-bold uppercase tracking-wider mb-1">
                        Clic o arrastra para reemplazar portada
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div>
                  <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                    Título de la Obra <span className="text-[#8B2FE0]">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#7ED957] focus:outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                    Categoría ESTRATO <span className="text-[#8B2FE0]">*</span>
                  </label>
                  <select
                    name="category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
                  >
                    <option value="apps-software" className="bg-[#0D0A08]">Apps &amp; BioTech</option>
                    <option value="animaciones" className="bg-[#0D0A08]">Animaciones</option>
                    <option value="visual-novel" className="bg-[#0D0A08]">Visual Novels</option>
                    <option value="games" className="bg-[#0D0A08]">Games</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                  Estado de Publicación <span className="text-[#8B2FE0]">*</span>
                </label>
                <select
                  name="status"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
                >
                  <option value="En Emisión" className="bg-[#0D0A08]">🟢 En Emisión</option>
                  <option value="Pausado" className="bg-[#0D0A08]">🟡 Pausado</option>
                  <option value="Finalizado" className="bg-[#0D0A08]">🔴 Finalizado</option>
                </select>
              </div>

              <div className="p-5 bg-black/40 border border-white/15 rounded-xl">
                <label className="block mb-3 text-xs font-bold text-white uppercase tracking-wider">
                  📄 Formato Principal de Lectura
                </label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setEditDocType('none')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editDocType === 'none'
                        ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957]'
                        : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                    }`}
                  >
                    🚫 Sin Documento
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDocType('pdf')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editDocType === 'pdf'
                        ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957]'
                        : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                    }`}
                  >
                    📄 Documento PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditDocType('markdown')}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      editDocType === 'markdown'
                        ? 'bg-[#7ED957] text-[#0D0A08] border-[#7ED957]'
                        : 'bg-black/60 text-[#F2EDE4]/60 border-white/10'
                    }`}
                  >
                    📖 Markdown (Obsidian)
                  </button>
                </div>

                <input type="hidden" name="file_type" value={editDocType === 'none' ? '' : editDocType} />

                {editDocType === 'pdf' && (
                  <div className="pt-2">
                    <label className="block mb-2 text-xs font-bold text-[#7ED957] uppercase tracking-wider">
                      Reemplazar Archivo PDF (.pdf)
                    </label>
                    <input
                      type="file"
                      name="doc_file"
                      accept=".pdf,application/pdf"
                      className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
                    />
                  </div>
                )}

                {editDocType === 'markdown' && (
                  <div className="flex flex-col gap-4 pt-2">
                    <div>
                      <label className="block mb-2 text-xs font-bold text-[#7ED957] uppercase tracking-wider">
                        Opción A: Reemplazar desde Archivo Markdown (.md)
                      </label>
                      <input
                        type="file"
                        name="doc_file"
                        accept=".md,.markdown,text/markdown"
                        className="w-full p-3 border border-white/20 bg-black/80 text-white rounded-xl text-xs font-mono cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-xs font-bold text-[#7ED957] uppercase tracking-wider">
                        Opción B: Editar Manuscrito Markdown Directo
                      </label>
                      <MarkdownEditorWithPreview
                        name="markdown_content"
                        initialValue={editMarkdownContent}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-Media Extensions Section */}
              <div className="p-5 bg-black/40 border border-[#FFD700]/30 rounded-xl space-y-4">
                <span className="text-xs font-bold text-[#FFD700] uppercase tracking-wider block">
                  🎬 MULTIMEDIA ADICIONAL NO EXCLUYENTE (OPCIONAL)
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                      🎬 URL de Video (YouTube / TikTok / Drive / MP4)
                    </label>
                    <input
                      type="url"
                      name="video_url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... o TikTok / Drive"
                      className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                      🎵 URL de Audio / Soundtrack BGM (MP3 / WAV)
                    </label>
                    <input
                      type="url"
                      name="audio_url"
                      value={editAudioUrl}
                      onChange={(e) => setEditAudioUrl(e.target.value)}
                      placeholder="https://ejemplo.com/soundtrack.mp3"
                      className="w-full p-3 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                    🖼️ Galería de Ilustraciones (una fila por imagen, con vista previa)
                  </label>
                  <GalleryUrlsEditor
                    name="gallery_urls"
                    value={editGalleryUrls}
                    onChange={setEditGalleryUrls}
                    accentColor="#7ED957"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                    ⬇️ Enlaces de Descarga Externos (ej. Google Drive)
                  </label>
                  <DownloadLinksEditor
                    name="download_links"
                    value={editDownloadLinks}
                    onChange={setEditDownloadLinks}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
                  Sinopsis / Resumen Técnico <span className="text-[#8B2FE0]">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  required
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl focus:border-[#7ED957] focus:outline-none resize-none text-xs leading-relaxed font-sans"
                />
              </div>

              <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#7ED957] hover:bg-green-400 text-[#0D0A08] font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'GUARDAR CAMBIOS DE LA OBRA →'}
                </button>
              </div>
            </>
          )}
        </form>
      )}

      {/* MODE 3: APPEND CHAPTER */}
      {formMode === 'append_chapter' && (
        <form action={appendAction} className="flex flex-col gap-6">
          <div className="p-4 bg-[#8B2FE0]/15 border border-[#8B2FE0]/40 rounded-xl text-xs text-[#C084FC] leading-relaxed">
            <span className="font-bold flex items-center gap-1.5 mb-1">
              <BookOpen className="w-4 h-4" /> AÑADIR CAPÍTULO A UNA OBRA EXISTENTE
            </span>
            Selecciona la Obra en la que deseas trabajar. Puedes elegir una <strong className="text-white">Temporada o Parte existente</strong> o crear una nueva para continuar redactando capítulos secuenciales.
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              1. Seleccionar Obra Objetivo (Nivel 1) <span className="text-[#8B2FE0]">*</span>
            </label>
            <select
              name="target_project_id"
              required
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setSelectedAct('');
              }}
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
            >
              <option value="">-- SELECCIONAR OBRA REGISTRADA --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0D0A08]">
                  [{p.category.toUpperCase()}] {p.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              2. Parte / Temporada / Acto (Nivel 2)
            </label>

            {existingActs.length > 0 && (
              <div className="mb-3">
                <span className="text-[11px] text-[#C084FC] block mb-1">
                  Elegir de las Temporadas / Partes existentes en esta obra:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedAct('')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      selectedAct === ''
                        ? 'bg-[#8B2FE0] text-white border-[#C084FC]'
                        : 'bg-black/60 text-[#F2EDE4]/70 border-white/10 hover:border-white/30'
                    }`}
                  >
                    + Crear nueva Temporada / Parte
                  </button>
                  {existingActs.map((act) => (
                    <button
                      type="button"
                      key={act}
                      onClick={() => setSelectedAct(act)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                        selectedAct === act
                          ? 'bg-[#8B2FE0] text-white border-[#C084FC]'
                          : 'bg-black/60 text-[#C084FC] border-[#8B2FE0]/40 hover:bg-[#8B2FE0]/20'
                      }`}
                    >
                      <Layers className="w-3 h-3 text-[#FFD700]" />
                      <span>{act}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <input
              type="text"
              name="act_or_season"
              value={selectedAct}
              onChange={(e) => setSelectedAct(e.target.value)}
              placeholder="Ej: Temporada 1, Parte I: Las Sombras, Prólogos"
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              3. Nombre del Capítulo (Nivel 3) <span className="text-[#8B2FE0]">*</span>
            </label>
            <input
              type="text"
              name="chapter_title"
              required
              placeholder="Ej: Prólogo: El Inicio, Capítulo 1, Capítulo 1.5: Interludio, Epílogo"
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl text-xs font-mono"
            />
          </div>

          <div>
            <label className="block mb-2 text-xs font-bold text-[#C084FC] uppercase tracking-wider">
              4. Redactar Contenido del Capítulo (Editor Interactivo &amp; Live Preview)
            </label>
            <MarkdownEditorWithPreview name="markdown_content" />
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10 mt-2">
            <button
              type="submit"
              disabled={isPending}
              className="bg-[#8B2FE0] hover:bg-[#C084FC] text-white font-bold px-8 py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ANEXAR CAPÍTULO A LA OBRA →'}
            </button>
          </div>
        </form>
      )}

      {/* MODE 4: MANAGE STUDIO & EDIT CHAPTERS */}
      {formMode === 'manage_studio' && (
        <div className="space-y-6">
          <div className="p-4 bg-[#7ED957]/15 border border-[#7ED957]/40 rounded-xl text-xs text-[#7ED957] leading-relaxed flex items-center justify-between">
            <div>
              <span className="font-bold flex items-center gap-1.5 mb-1">
                <FolderTree className="w-4 h-4" /> CMS EDITOR DE ESTRUCTURA DE OBRA &amp; AUTO-SAVE DRAG &amp; DROP
              </span>
              Arrastra cualquier capítulo <strong className="text-white">⠿</strong> y <strong className="text-white">suéltalo dentro de otra Temporada</strong>. El cambio se guarda <strong className="text-white">automáticamente en Supabase</strong> de inmediato.
            </div>

            {autoSaveStatus && (
              <div className="flex items-center gap-2 font-bold px-3 py-1.5 rounded-lg bg-black/60 border border-[#7ED957] text-[#7ED957] shrink-0 text-[11px] animate-fadeIn">
                {autoSaveStatus === 'saving' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando en Supabase...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Guardado Auto en DB
                  </>
                )}
              </div>
            )}
          </div>

          {/* Select Work */}
          <div>
            <label className="block mb-2 text-xs font-bold text-[#F2EDE4] uppercase tracking-wider">
              Seleccionar Obra a Gestionar / Editar <span className="text-[#8B2FE0]">*</span>
            </label>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                setEditingChapterIndex(null);
                setRenamingActName(null);
              }}
              className="w-full p-3.5 border border-white/20 bg-black/60 text-white rounded-xl appearance-none text-xs font-mono font-bold"
            >
              <option value="">-- SELECCIONAR OBRA PARA EDITAR --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0D0A08]">
                  [{p.category.toUpperCase()}] {p.title}
                </option>
              ))}
            </select>
          </div>

          {/* Tree Structure Display */}
          {selectedProjectId && (
            <div className="space-y-6 pt-4 border-t border-white/15">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#C084FC]" />
                  ESTRUCTURA DE {currentProject ? currentProject.title : 'OBRA SELECCIONADA'} ({chapters.length} CAPÍTULOS EN {actGroupsState.length} TEMPORADAS)
                </span>

                <button
                  type="button"
                  onClick={() => setShowCreateActModal(true)}
                  className="px-3.5 py-2 bg-[#FFD700]/20 hover:bg-[#FFD700] text-[#FFD700] hover:text-[#0D0A08] border border-[#FFD700]/50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ CREAR TEMPORADA VACÍA</span>
                </button>
              </div>

              {/* CREATE EMPTY ACT MODAL */}
              {showCreateActModal && (
                <div className="p-4 bg-black/95 border border-[#FFD700] rounded-xl space-y-3 shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2">
                    <span className="text-xs font-bold text-[#FFD700] uppercase flex items-center gap-2">
                      <FolderPlus className="w-4 h-4" /> CREAR NUEVA TEMPORADA O PARTE VACÍA
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCreateActModal(false)}
                      className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form action={createActFormAction} className="flex flex-col sm:flex-row gap-2">
                    <input type="hidden" name="target_project_id" value={selectedProjectId} />
                    <input
                      type="text"
                      name="act_name"
                      value={newEmptyActName}
                      onChange={(e) => setNewEmptyActName(e.target.value)}
                      required
                      placeholder="Ej: Temporada 2: El Conflicto, Epílogos &amp; Extras..."
                      className="flex-1 p-2.5 border border-white/20 bg-black text-white rounded-lg text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-5 py-2.5 bg-[#FFD700] text-[#0D0A08] font-bold rounded-lg text-xs hover:bg-yellow-400 cursor-pointer shadow-lg"
                    >
                      CREAR TEMPORADA
                    </button>
                  </form>
                </div>
              )}

              {/* EDIT CHAPTER MODAL FORM WITH GUARANTEED REAL DYNAMIC INDEX */}
              {editingChapterIndex !== null && (
                <div className="p-6 bg-black/95 border border-[#8B2FE0] rounded-2xl space-y-4 shadow-2xl animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3">
                    <span className="text-xs font-bold text-[#C084FC] uppercase flex items-center gap-2">
                      <Edit3 className="w-4 h-4" /> EDITANDO CAPÍTULO #{editingChapterIndex + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingChapterIndex(null)}
                      className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form action={updateAction} className="space-y-4">
                    <input type="hidden" name="target_project_id" value={selectedProjectId} />
                    <input type="hidden" name="chapter_index" value={editingChapterIndex} />

                    <input
                      type="hidden"
                      name="act_or_season"
                      value={editingChapterActSelect === '__new__' ? editingChapterCustomAct : editingChapterActSelect}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 text-[11px] font-bold text-white uppercase">
                          Título del Capítulo
                        </label>
                        <input
                          type="text"
                          name="chapter_title"
                          value={editingChapterTitle}
                          onChange={(e) => setEditingChapterTitle(e.target.value)}
                          required
                          className="w-full p-3 border border-white/20 bg-black text-white rounded-xl text-xs font-mono font-bold"
                        />
                      </div>

                      {/* SELECTOR FOR MOVING CHAPTER TO ANOTHER ACT/SEASON */}
                      <div>
                        <label className="block mb-1 text-[11px] font-bold text-[#FFD700] uppercase">
                          Mover a Temporada / Parte (Selector Nivel 2)
                        </label>
                        <select
                          value={editingChapterActSelect}
                          onChange={(e) => setEditingChapterActSelect(e.target.value)}
                          className="w-full p-3 border border-white/20 bg-black text-white rounded-xl text-xs font-mono font-bold appearance-none mb-2"
                        >
                          <option value="" className="bg-[#0D0A08]">-- Sin Temporada (Capítulo General) --</option>
                          {existingActs.map((act) => (
                            <option key={act} value={act} className="bg-[#0D0A08]">
                              Existente: {act}
                            </option>
                          ))}
                          <option value="__new__" className="bg-[#0D0A08] text-[#FFD700]">
                            + Crear Nueva Temporada y mover aquí...
                          </option>
                        </select>

                        {editingChapterActSelect === '__new__' && (
                          <input
                            type="text"
                            value={editingChapterCustomAct}
                            onChange={(e) => setEditingChapterCustomAct(e.target.value)}
                            required
                            placeholder="Escribe el nombre de la nueva Temporada..."
                            className="w-full p-2.5 border border-[#FFD700] bg-black text-white rounded-xl text-xs font-mono font-bold"
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block mb-1 text-[11px] font-bold text-[#C084FC] uppercase">
                        Contenido del Capítulo (Markdown ESTRATO)
                      </label>
                      <MarkdownEditorWithPreview
                        name="markdown_content"
                        initialValue={editingChapterContent}
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setEditingChapterIndex(null)}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        CANCELAR
                      </button>
                      <button
                        type="submit"
                        disabled={isPending}
                        className="px-6 py-2 bg-[#8B2FE0] hover:bg-[#C084FC] text-white rounded-xl text-xs font-bold transition-all shadow-xl flex items-center gap-2 cursor-pointer"
                      >
                        <Save className="w-4 h-4" /> GUARDAR CAMBIOS DEL CAPÍTULO
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* RENAME ACT FORM */}
              {renamingActName !== null && (
                <div className="p-4 bg-black/90 border border-[#FFD700] rounded-xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/15 pb-2">
                    <span className="text-xs font-bold text-[#FFD700] uppercase flex items-center gap-2">
                      <Layers className="w-4 h-4" /> RENOMBRAR TEMPORADA: {renamingActName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setRenamingActName(null)}
                      className="p-1 text-[#F2EDE4]/60 hover:text-white cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <form action={renameActFormAction} className="flex gap-2">
                    <input type="hidden" name="target_project_id" value={selectedProjectId} />
                    <input type="hidden" name="old_act_name" value={renamingActName} />
                    <input
                      type="text"
                      name="new_act_name"
                      value={newActName}
                      onChange={(e) => setNewActName(e.target.value)}
                      required
                      placeholder="Nuevo nombre para esta Temporada/Parte..."
                      className="flex-1 p-2.5 border border-white/20 bg-black text-white rounded-lg text-xs font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isPending}
                      className="px-4 py-2.5 bg-[#FFD700] text-[#0D0A08] font-bold rounded-lg text-xs hover:bg-yellow-400 cursor-pointer"
                    >
                      GUARDAR
                    </button>
                  </form>
                </div>
              )}

              {/* DRAGGABLE & DROP TARGET CONTAINER CARDS BY ACT */}
              <div className="space-y-6">
                {actGroupsState.map((group, groupIdx) => {
                  const isBeingDragged = draggedGroupIndex === groupIdx;
                  const isDragOverTarget = dragOverGroupIdx === groupIdx;

                  if (group.isEmpty && group.actName) {
                    return (
                      <div
                        key={groupIdx}
                        draggable
                        onDragStart={(e) => {
                          e.stopPropagation();
                          setDraggedGroupIndex(groupIdx);
                        }}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverGroupIdx !== groupIdx) setDragOverGroupIdx(groupIdx);
                        }}
                        onDragLeave={() => {
                          if (dragOverGroupIdx === groupIdx) setDragOverGroupIdx(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleContainerDrop(groupIdx);
                        }}
                        className={`p-5 bg-[#FFD700]/10 border-2 border-dashed rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl transition-all ${
                          isDragOverTarget
                            ? 'border-[#7ED957] bg-[#7ED957]/20 scale-[1.01]'
                            : isBeingDragged
                            ? 'opacity-30 border-white'
                            : 'border-[#FFD700]/50 hover:border-[#FFD700]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="p-2 cursor-grab text-[#FFD700] hover:text-white active:cursor-grabbing">
                            <GripVertical className="w-5 h-5" />
                          </span>
                          <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                            <Layers className="w-4 h-4" />
                            <span>{group.actName} (0 CAPÍTULOS - TEMPORADA VACÍA)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveGroup(groupIdx, groupIdx - 1)}
                            disabled={groupIdx === 0}
                            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-30"
                            title="Mover Temporada Arriba"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveGroup(groupIdx, groupIdx + 1)}
                            disabled={groupIdx === actGroupsState.length - 1}
                            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-30"
                            title="Mover Temporada Abajo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRenamingActName(group.actName || '');
                              setNewActName(group.actName || '');
                            }}
                            className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" /> RENOMBRAR
                          </button>

                          <form action={deleteActFormAction} className="inline">
                            <input type="hidden" name="target_project_id" value={selectedProjectId} />
                            <input type="hidden" name="act_name" value={group.actName} />
                            <button
                              type="submit"
                              disabled={isPending}
                              onClick={(e) => {
                                if (!confirm(`¿Estás seguro de eliminar la temporada vacía "${group.actName}"?`)) {
                                  e.preventDefault();
                                }
                              }}
                              className="px-2.5 py-1 bg-[#7A1220]/40 hover:bg-[#7A1220] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-[#7A1220]"
                            >
                              <Trash2 className="w-3 h-3" /> ELIMINAR
                            </button>
                          </form>

                          <button
                            type="button"
                            onClick={() => {
                              setFormMode('append_chapter');
                              setSelectedAct(group.actName || '');
                            }}
                            className="px-2.5 py-1 bg-[#FFD700] hover:bg-yellow-400 text-[#0D0A08] font-bold rounded text-[10px] flex items-center gap-1 cursor-pointer shadow-md"
                          >
                            <PlusCircle className="w-3 h-3" /> + AÑADIR CAPÍTULO
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={groupIdx}
                      draggable
                      onDragStart={(e) => {
                        e.stopPropagation();
                        setDraggedGroupIndex(groupIdx);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        if (dragOverGroupIdx !== groupIdx) setDragOverGroupIdx(groupIdx);
                      }}
                      onDragLeave={() => {
                        if (dragOverGroupIdx === groupIdx) setDragOverGroupIdx(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        handleContainerDrop(groupIdx);
                      }}
                      className={`p-5 bg-black/70 border-2 rounded-2xl space-y-4 shadow-xl relative transition-all ${
                        isDragOverTarget
                          ? 'border-[#7ED957] bg-[#7ED957]/10 scale-[1.005]'
                          : isBeingDragged
                          ? 'opacity-30 border-white'
                          : 'border-[#8B2FE0]/50 hover:border-[#8B2FE0]'
                      }`}
                    >
                      {/* Parent Act Container Header */}
                      {group.actName ? (
                        <div className="flex items-center justify-between pb-3 border-b border-[#FFD700]/30">
                          <div className="flex items-center gap-3">
                            <span className="p-1.5 cursor-grab text-[#C084FC] hover:text-white active:cursor-grabbing">
                              <GripVertical className="w-5 h-5" />
                            </span>
                            <div className="flex items-center gap-2 text-xs font-bold text-[#FFD700] uppercase tracking-wider">
                              <Layers className="w-4 h-4" />
                              <span>{group.actName} ({group.items.length} CAPÍTULOS)</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => moveGroup(groupIdx, groupIdx - 1)}
                              disabled={groupIdx === 0}
                              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-30"
                              title="Mover Temporada Arriba"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveGroup(groupIdx, groupIdx + 1)}
                              disabled={groupIdx === actGroupsState.length - 1}
                              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-30"
                              title="Mover Temporada Abajo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRenamingActName(group.actName || '');
                                setNewActName(group.actName || '');
                              }}
                              className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" /> RENOMBRAR
                            </button>

                            <form action={deleteActFormAction} className="inline">
                              <input type="hidden" name="target_project_id" value={selectedProjectId} />
                              <input type="hidden" name="act_name" value={group.actName} />
                              <button
                                type="submit"
                                disabled={isPending}
                                onClick={(e) => {
                                  if (!confirm(`¿Estás seguro de eliminar la temporada "${group.actName}"? Los capítulos pertenecientes a esta temporada quedarán como capítulos generales.`)) {
                                    e.preventDefault();
                                  }
                                }}
                                className="px-2.5 py-1 bg-[#7A1220]/40 hover:bg-[#7A1220] text-white rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-[#7A1220]"
                              >
                                <Trash2 className="w-3 h-3" /> ELIMINAR
                              </button>
                            </form>

                            <button
                              type="button"
                              onClick={() => {
                                setFormMode('append_chapter');
                                setSelectedAct(group.actName || '');
                              }}
                              className="px-2.5 py-1 bg-[#8B2FE0]/40 hover:bg-[#8B2FE0] text-[#F2EDE4] rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer border border-[#8B2FE0]"
                            >
                              <PlusCircle className="w-3 h-3" /> + AÑADIR CAPÍTULO
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs font-bold text-[#C084FC] uppercase pb-2 border-b border-white/10 flex items-center gap-2">
                          <span>CAPÍTULOS GENERALES / SIN TEMPORADA</span>
                          <span className="text-[10px] text-[#F2EDE4]/60 bg-white/10 px-2 py-0.5 rounded">
                            {group.items.length} Capítulos
                          </span>
                        </div>
                      )}

                      {/* Child Chapter Items inside this Act Container */}
                      <div className="space-y-2.5">
                        {group.items.map(({ chap }, chapIdxInGroup) => {
                          const realIndex = getRealChapterIndex(chap);

                          return (
                            <div
                              key={chap.id}
                              draggable
                              onDragStart={(e) => {
                                e.stopPropagation();
                                setDraggedChapter({
                                  fromGroupIdx: groupIdx,
                                  itemIdx: chapIdxInGroup,
                                  chap,
                                });
                              }}
                              onDragEnd={() => {
                                setDraggedChapter(null);
                                setDragOverGroupIdx(null);
                              }}
                              className="p-3.5 bg-[#160E0A] border border-white/15 hover:border-[#C084FC] rounded-xl flex items-center justify-between transition-all cursor-grab active:cursor-grabbing"
                            >
                              <div className="flex items-center gap-3">
                                <span className="p-1 text-[#C084FC] hover:text-white">
                                  <GripVertical className="w-4 h-4" />
                                </span>
                                <ChevronRight className="w-4 h-4 text-[#C084FC] shrink-0" />
                                <div>
                                  <span className="font-bold text-xs text-white block">
                                    {chap.title}
                                  </span>
                                  <span className="text-[10px] text-[#F2EDE4]/50">
                                    {chap.blocks.length} Bloques de contenido &bull; Sección #{realIndex >= 0 ? realIndex + 1 : '?'}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => moveChapterInGroup(groupIdx, chapIdxInGroup, chapIdxInGroup - 1)}
                                  disabled={chapIdxInGroup === 0}
                                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-20"
                                  title="Subir Capítulo"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => moveChapterInGroup(groupIdx, chapIdxInGroup, chapIdxInGroup + 1)}
                                  disabled={chapIdxInGroup === group.items.length - 1}
                                  className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded cursor-pointer disabled:opacity-20"
                                  title="Bajar Capítulo"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => startEditingChapter(chap)}
                                  className="p-2 bg-[#8B2FE0]/30 hover:bg-[#8B2FE0] text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-[#8B2FE0]/50"
                                >
                                  <Edit3 className="w-3.5 h-3.5" /> EDITAR / MOVER
                                </button>

                                <form action={deleteAction} className="inline">
                                  <input type="hidden" name="target_project_id" value={selectedProjectId} />
                                  <input type="hidden" name="chapter_index" value={realIndex} />
                                  <button
                                    type="submit"
                                    disabled={isPending}
                                    onClick={(e) => {
                                      if (!confirm(`¿Eliminar el capítulo "${chap.title}" de esta obra?`)) {
                                        e.preventDefault();
                                      }
                                    }}
                                    className="p-2 bg-[#7A1220]/30 hover:bg-[#7A1220] text-[#F2EDE4] rounded-lg text-xs font-bold cursor-pointer transition-all border border-[#7A1220]/50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
