@extends('layouts.admin')

@section('title', 'Academic Syllabi')
@section('header', 'Curriculum & Syllabi')

@section('content')
<div class="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
    <p class="text-gray-500">View and manage academic curriculum syllabi across classes, subjects, and terms.</p>
    @if(Auth::user()->role === 'admin')
        <button onclick="document.getElementById('createSyllabusModal').classList.remove('hidden')" class="bg-primary hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center w-fit">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add New Syllabus
        </button>
    @endif
</div>

<!-- Search & Filters -->
<div class="bg-white p-4 rounded-xl border border-gray-100 shadow-xs mb-6">
    <form action="{{ route('syllabi.index') }}" method="GET" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
        <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Class</label>
            <select name="school_class_id" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                <option value="">All Classes</option>
                @foreach($classes as $c)
                    <option value="{{ $c->id }}" {{ request('school_class_id') == $c->id ? 'selected' : '' }}>{{ $c->name }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Subject</label>
            <select name="subject_id" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                <option value="">All Subjects</option>
                @foreach($subjects as $s)
                    <option value="{{ $s->id }}" {{ request('subject_id') == $s->id ? 'selected' : '' }}>{{ $s->name }}</option>
                @endforeach
            </select>
        </div>
        <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase mb-1">Term</label>
            <select name="term" class="block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                <option value="">All Terms</option>
                <option value="First Term" {{ request('term') == 'First Term' ? 'selected' : '' }}>First Term</option>
                <option value="Second Term" {{ request('term') == 'Second Term' ? 'selected' : '' }}>Second Term</option>
                <option value="Third Term" {{ request('term') == 'Third Term' ? 'selected' : '' }}>Third Term</option>
            </select>
        </div>
        <div class="flex gap-2">
            <button type="submit" class="flex-1 bg-primary hover:bg-emerald-600 text-white py-1.5 px-4 rounded-md text-sm font-semibold transition-colors shadow-xs">
                Apply Filters
            </button>
            <a href="{{ route('syllabi.index') }}" class="bg-gray-100 hover:bg-gray-200 text-gray-700 py-1.5 px-3 rounded-md text-sm font-semibold transition-colors text-center">
                Reset
            </a>
        </div>
    </form>
</div>

<!-- Success Alert -->
@if(session('success'))
<div class="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center shadow-xs">
    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
    {{ session('success') }}
</div>
@endif

<!-- Syllabi Cards Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
    @forelse($syllabi as $sy)
        <div class="bg-white rounded-xl shadow-xs border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden">
            <div class="p-6">
                <div class="flex items-center justify-between gap-2 mb-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {{ $sy->schoolClass->name }}
                    </span>
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {{ $sy->term }}
                    </span>
                </div>
                
                <h3 class="text-md font-bold text-gray-900 mb-1">{{ $sy->title }}</h3>
                <p class="text-xs text-gray-400 font-semibold mb-3">{{ $sy->subject->name }}</p>
                
                @if($sy->content)
                    <p class="text-sm text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                        {{ $sy->content }}
                    </p>
                @else
                    <p class="text-sm text-gray-400 italic mb-4">No description content provided.</p>
                @endif
            </div>
            
            <div class="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <div class="flex items-center text-xs text-gray-400">
                    <svg class="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    {{ $sy->created_at->format('M d, Y') }}
                </div>
                
                <div class="flex items-center space-x-2">
                    @if($sy->file_path)
                        <a href="{{ asset('storage/' . $sy->file_path) }}" target="_blank" class="text-primary hover:text-emerald-700 p-1" title="Download Document">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </a>
                    @endif
                    
                    <a href="{{ route('syllabi.show', $sy) }}" class="text-xs font-semibold bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 py-1.5 px-3 rounded-md transition-colors shadow-xs">
                        View
                    </a>

                    @if(Auth::user()->role === 'admin')
                        <button onclick="openEditSyllabusModal({{ $sy->id }}, '{{ $sy->school_class_id }}', '{{ $sy->subject_id }}', '{{ addslashes($sy->term) }}', '{{ addslashes($sy->title) }}', '{{ addslashes($sy->content ?? '') }}')" class="text-indigo-600 hover:text-indigo-900 p-1" title="Edit">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                        </button>
                        
                        <form action="{{ route('syllabi.destroy', $sy) }}" method="POST" class="inline-block" onsubmit="return confirm('Are you sure you want to delete this syllabus?');">
                            @csrf
                            @method('DELETE')
                            <button type="submit" class="text-red-600 hover:text-red-900 p-1" title="Delete">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        </form>
                    @endif
                </div>
            </div>
        </div>
    @empty
        <div class="col-span-full bg-white rounded-xl shadow-xs border border-gray-100 p-12 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            <p class="text-md font-semibold">No syllabus records found.</p>
            <p class="text-xs text-gray-400 mt-1">Try selecting different filter options or create a new syllabus.</p>
        </div>
    @endforelse
</div>

@if(Auth::user()->role === 'admin')
<!-- Create Modal -->
<div id="createSyllabusModal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick="document.getElementById('createSyllabusModal').classList.add('hidden')"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
            <form action="{{ route('syllabi.store') }}" method="POST" enctype="multipart/form-data">
                @csrf
                <div class="bg-white px-6 pt-6 pb-4 sm:p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-emerald-500 pb-2">Add New Syllabus</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Class *</label>
                            <select name="school_class_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Class</option>
                                @foreach($classes as $c)
                                    <option value="{{ $c->id }}">{{ $c->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Subject *</label>
                            <select name="subject_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Subject</option>
                                @foreach($subjects as $s)
                                    <option value="{{ $s->id }}">{{ $s->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Term *</label>
                            <select name="term" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Term</option>
                                <option value="First Term">First Term</option>
                                <option value="Second Term">Second Term</option>
                                <option value="Third Term">Third Term</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Syllabus Title *</label>
                            <input type="text" name="title" required placeholder="e.g. First Term Mathematics Curriculum" class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Content / Description</label>
                            <textarea name="content" rows="4" placeholder="Brief outline of topics or description..." class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Syllabus File (PDF, DOC, Images - Max 10MB)</label>
                            <input type="file" name="file" accept=".pdf,.doc,.docx,image/*" class="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
                    <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-primary text-sm font-semibold text-white hover:bg-emerald-600 sm:ml-3 sm:w-auto shadow-sm">
                        Create Syllabus
                    </button>
                    <button type="button" onclick="document.getElementById('createSyllabusModal').classList.add('hidden')" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto shadow-xs">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Edit Modal -->
<div id="editSyllabusModal" class="hidden fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onclick="document.getElementById('editSyllabusModal').classList.add('hidden')"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
            <form id="editSyllabusForm" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PUT')
                <div class="bg-white px-6 pt-6 pb-4 sm:p-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wide border-b-2 border-emerald-500 pb-2">Edit Syllabus</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Class *</label>
                            <select name="school_class_id" id="edit_school_class_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Class</option>
                                @foreach($classes as $c)
                                    <option value="{{ $c->id }}">{{ $c->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Subject *</label>
                            <select name="subject_id" id="edit_subject_id" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Subject</option>
                                @foreach($subjects as $s)
                                    <option value="{{ $s->id }}">{{ $s->name }}</option>
                                @endforeach
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Term *</label>
                            <select name="term" id="edit_term" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                                <option value="">Select Term</option>
                                <option value="First Term">First Term</option>
                                <option value="Second Term">Second Term</option>
                                <option value="Third Term">Third Term</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Syllabus Title *</label>
                            <input type="text" name="title" id="edit_title" required class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary">
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Content / Description</label>
                            <textarea name="content" id="edit_content" rows="4" class="mt-1 block w-full border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs font-semibold text-gray-700">Update Syllabus File (Optional - Max 10MB)</label>
                            <input type="file" name="file" accept=".pdf,.doc,.docx,image/*" class="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer">
                        </div>
                    </div>
                </div>
                <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-200">
                    <button type="submit" class="w-full inline-flex justify-center rounded-lg border border-transparent px-4 py-2 bg-primary text-sm font-semibold text-white hover:bg-emerald-600 sm:ml-3 sm:w-auto shadow-sm">
                        Save Changes
                    </button>
                    <button type="button" onclick="document.getElementById('editSyllabusModal').classList.add('hidden')" class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto shadow-xs">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
    function openEditSyllabusModal(id, classId, subjectId, term, title, content) {
        document.getElementById('editSyllabusForm').action = '/syllabi/' + id;
        document.getElementById('edit_school_class_id').value = classId;
        document.getElementById('edit_subject_id').value = subjectId;
        document.getElementById('edit_term').value = term;
        document.getElementById('edit_title').value = title;
        document.getElementById('edit_content').value = content;
        
        document.getElementById('editSyllabusModal').classList.remove('hidden');
    }
</script>
@endif
@endsection
