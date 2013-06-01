SOURCES = core-estimator.js
SOURCES_TEMP =
OUTPUTS = $(SOURCES:.js=.min.js) $(SOURCES_TEMP:.js=.min.js)

COMPILATION_LEVEL = SIMPLE_OPTIMIZATIONS # WHITESPACE_ONLY, SIMPLE_OPTIMIZATIONS, or ADVANCED_OPTIMIZATIONS
USE_CLOSURE_LIBRARY = false
WARNING_LEVEL = VERBOSE
LANGUAGE = ECMASCRIPT5_STRICT # ECMASCRIPT3, ECMASCRIPT5, or ECMASCRIPT5_STRICT
INFO=statistics

CLOSURE_REST_API = http://closure-compiler.appspot.com/compile

# Closure Compiler Makefile
# Brought to you by the ΩF:∅ Working Group <http://wg.oftn.org>
# ---
#
# Set SOURCES to the list of JavaScript files you want to minify.
# Minified sources will be created with a .min.js extension.
#
# For statistics on the compilation:
#     make report
#
# For a list of warnings in your sources:
#     make report INFO=warnings
#
# For a list of errors in your sources:
#     make report INFO=errors
#
# ---
#
# If you want to group multiple sources into one minified production,
# simply create a new rule like the following:
#
# project-build.js: dep1.js dep2.js dep3.js
#     cat $^ > $@
#
# Be sure to add the target to SOURCES_TEMP so it can be cleaned.
#
# ---
#
# API reference: https://developers.google.com/closure/compiler/docs/api-ref

.PHONY: all report clean
.SUFFIXES: .js .min.js

all: $(OUTPUTS)

.js.min.js:
	curl -s \
		-d compilation_level=$(COMPILATION_LEVEL) \
		-d output_format=text \
		-d output_info=compiled_code \
		-d use_closure_library=$(USE_CLOSURE_LIBRARY) \
		-d language=$(LANGUAGE) \
		--data-urlencode "js_code@$<" \
		$(CLOSURE_REST_API) > $@

report:
	@ for source in $(SOURCES); do \
		echo "--- Start of $$source $(INFO) report ---"; \
		curl -s \
			-d compilation_level=$(COMPILATION_LEVEL) \
			-d output_format=text \
			-d output_info=$(INFO) \
			-d use_closure_library=$(USE_CLOSURE_LIBRARY) \
			-d warning_level=$(WARNING_LEVEL) \
			-d language=$(LANGUAGE) \
			--data-urlencode "js_code@$$source" \
			$(CLOSURE_REST_API) | sed s/Input_0/$$source/; \
		echo "--- End of $$source $(INFO) report ---"; \
	done \

clean:
	-@ $(RM) $(OUTPUTS) $(SOURCES_TEMP)
